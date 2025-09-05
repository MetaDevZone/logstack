/**
 * 🔒 S3 Security Manager
 * Protected file access with pre-signed URLs and access control
 */

const AWS = require("aws-sdk");
const crypto = require("crypto");

class S3SecurityManager {
  constructor(config) {
    this.s3 = new AWS.S3({
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      region: config.region,
    });
    this.bucket = config.bucket;
    this.defaultExpiration = config.defaultExpiration || 3600; // 1 hour
    this.accessKeys = new Map(); // Store access keys
  }

  /**
   * Generate secure access token for file access
   */
  generateAccessToken(userId, permissions = ["read"]) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiration = Date.now() + this.defaultExpiration * 1000;

    this.accessKeys.set(token, {
      userId,
      permissions,
      expiration,
      createdAt: Date.now(),
    });

    return token;
  }

  /**
   * Validate access token
   */
  validateAccessToken(token) {
    const accessData = this.accessKeys.get(token);

    if (!accessData) {
      throw new Error("Invalid access token");
    }

    if (Date.now() > accessData.expiration) {
      this.accessKeys.delete(token);
      throw new Error("Access token expired");
    }

    return accessData;
  }

  /**
   * Generate pre-signed URL for secure file access
   */
  async generatePresignedUrl(key, options = {}) {
    const {
      operation = "getObject",
      expiration = this.defaultExpiration,
      userId,
      accessToken,
    } = options;

    // Validate access token if provided
    if (accessToken) {
      const accessData = this.validateAccessToken(accessToken);
      if (!accessData.permissions.includes("read")) {
        throw new Error("Insufficient permissions for file access");
      }
    }

    const params = {
      Bucket: this.bucket,
      Key: key,
      Expires: expiration,
    };

    try {
      const url = await this.s3.getSignedUrlPromise(operation, params);

      // Log access attempt for audit
      console.log(
        `🔐 Pre-signed URL generated for user: ${
          userId || "anonymous"
        }, file: ${key}`
      );

      return {
        url,
        expiration: Date.now() + expiration * 1000,
        accessToken,
        userId,
      };
    } catch (error) {
      console.error("❌ Failed to generate pre-signed URL:", error);
      throw error;
    }
  }

  /**
   * Check if user has permission to access specific file
   */
  async checkFilePermission(key, userId, operation = "read") {
    // Extract date and service from file key
    const pathParts = key.split("/");
    const dateFolder = pathParts[1]; // 2025/09/04
    const serviceFolder = pathParts[2]; // service-name

    // Custom permission logic
    const permissions = await this.getUserPermissions(userId);

    // Check date-based access
    if (permissions.dateRestriction) {
      const fileDate = new Date(dateFolder);
      const cutoffDate = new Date(
        Date.now() - permissions.dayLimit * 24 * 60 * 60 * 1000
      );

      if (fileDate < cutoffDate) {
        throw new Error(
          `Access denied: File older than ${permissions.dayLimit} days`
        );
      }
    }

    // Check service-based access
    if (
      permissions.serviceRestriction &&
      !permissions.allowedServices.includes(serviceFolder)
    ) {
      throw new Error(
        `Access denied: No permission for service: ${serviceFolder}`
      );
    }

    return true;
  }

  /**
   * Get user permissions (customize based on your needs)
   */
  async getUserPermissions(userId) {
    // Default permissions - customize this based on your auth system
    const defaultPermissions = {
      read: true,
      write: false,
      delete: false,
      dateRestriction: true,
      dayLimit: 180, // Can access files from last 180 days (matches S3 retention)
      serviceRestriction: false,
      allowedServices: [],
    };

    // You can implement database lookup here
    // const userPerms = await db.getUserPermissions(userId);

    return defaultPermissions;
  }

  /**
   * Secure file download with access control
   */
  async secureFileDownload(key, userId, accessToken) {
    try {
      // Validate access token
      if (accessToken) {
        this.validateAccessToken(accessToken);
      }

      // Check file permissions
      await this.checkFilePermission(key, userId, "read");

      // Generate pre-signed URL
      const result = await this.generatePresignedUrl(key, {
        userId,
        accessToken,
        expiration: 300, // 5 minutes for download
      });

      // Log successful access
      console.log(`✅ Secure access granted - User: ${userId}, File: ${key}`);

      return result;
    } catch (error) {
      // Log failed access attempt
      console.error(
        `❌ Access denied - User: ${userId}, File: ${key}, Error: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * List accessible files for user
   */
  async listAccessibleFiles(userId, prefix = "") {
    try {
      const permissions = await this.getUserPermissions(userId);

      const params = {
        Bucket: this.bucket,
        Prefix: prefix,
        MaxKeys: 1000,
      };

      const result = await this.s3.listObjectsV2(params).promise();

      // Filter files based on user permissions
      const accessibleFiles = result.Contents.filter((file) => {
        try {
          // Check if user can access this file
          const pathParts = file.Key.split("/");
          const dateFolder = pathParts[1];

          if (permissions.dateRestriction) {
            const fileDate = new Date(dateFolder);
            const cutoffDate = new Date(
              Date.now() - permissions.dayLimit * 24 * 60 * 60 * 1000
            );
            return fileDate >= cutoffDate;
          }

          return true;
        } catch {
          return false;
        }
      });

      return accessibleFiles.map((file) => ({
        key: file.Key,
        size: file.Size,
        lastModified: file.LastModified,
        accessible: true,
      }));
    } catch (error) {
      console.error("❌ Failed to list accessible files:", error);
      throw error;
    }
  }

  /**
   * Revoke access token
   */
  revokeAccessToken(token) {
    const deleted = this.accessKeys.delete(token);
    if (deleted) {
      console.log(`🔒 Access token revoked: ${token.substring(0, 8)}...`);
    }
    return deleted;
  }

  /**
   * Clean expired tokens
   */
  cleanExpiredTokens() {
    const now = Date.now();
    let cleaned = 0;

    for (const [token, data] of this.accessKeys) {
      if (now > data.expiration) {
        this.accessKeys.delete(token);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} expired access tokens`);
    }

    return cleaned;
  }

  /**
   * Get access statistics
   */
  getAccessStats() {
    const activeTokens = this.accessKeys.size;
    const stats = {
      activeTokens,
      totalGenerated: 0, // You can track this
      revokedTokens: 0, // You can track this
    };

    return stats;
  }
}

module.exports = { S3SecurityManager };
