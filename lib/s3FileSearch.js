/**
 * 🔍 S3 File Search & Filter Manager
 * Advanced file search, filtering, and access functionality
 */

const { S3SecurityManager } = require("./s3Security");

class S3FileSearchManager extends S3SecurityManager {
  constructor(config) {
    super(config);
  }

  /**
   * Advanced file search with multiple filters
   */
  async searchFiles(userId, searchOptions = {}) {
    try {
      const {
        dateRange = {},
        serviceFilter = null,
        fileNamePattern = null,
        sizeRange = {},
        fileExtensions = [],
        sortBy = "lastModified",
        sortOrder = "desc",
        limit = 100,
        offset = 0,
      } = searchOptions;

      // Validate user permissions first
      const permissions = await this.getUserPermissions(userId);

      // Get all accessible files
      let allFiles = await this.listAccessibleFiles(userId);

      // Apply date range filter
      if (dateRange.from || dateRange.to) {
        allFiles = this.filterByDateRange(allFiles, dateRange, permissions);
      }

      // Apply service filter
      if (serviceFilter) {
        allFiles = this.filterByService(allFiles, serviceFilter);
      }

      // Apply filename pattern filter
      if (fileNamePattern) {
        allFiles = this.filterByFileName(allFiles, fileNamePattern);
      }

      // Apply file size filter
      if (sizeRange.min || sizeRange.max) {
        allFiles = this.filterBySize(allFiles, sizeRange);
      }

      // Apply file extension filter
      if (fileExtensions.length > 0) {
        allFiles = this.filterByExtensions(allFiles, fileExtensions);
      }

      // Sort files
      allFiles = this.sortFiles(allFiles, sortBy, sortOrder);

      // Apply pagination
      const totalCount = allFiles.length;
      const paginatedFiles = allFiles.slice(offset, offset + limit);

      console.log(
        `🔍 Search completed: ${paginatedFiles.length}/${totalCount} files for user: ${userId}`
      );

      return {
        success: true,
        files: paginatedFiles,
        totalCount,
        hasMore: offset + limit < totalCount,
        searchOptions,
        pagination: {
          limit,
          offset,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: Math.floor(offset / limit) + 1,
        },
      };
    } catch (error) {
      console.error(`❌ File search failed for user ${userId}:`, error);
      return {
        success: false,
        error: error.message,
        files: [],
      };
    }
  }

  /**
   * Filter files by date range
   */
  filterByDateRange(files, dateRange, permissions) {
    const { from, to } = dateRange;

    return files.filter((file) => {
      try {
        // Extract date from file path (production-logs/2025/09/04/...)
        const pathParts = file.key.split("/");
        const dateFolder = pathParts[1]; // 2025/09/04
        const fileDate = new Date(dateFolder);

        // Check against user's date restrictions
        if (permissions.dateRestriction) {
          const cutoffDate = new Date(
            Date.now() - permissions.dayLimit * 24 * 60 * 60 * 1000
          );
          if (fileDate < cutoffDate) {
            return false;
          }
        }

        // Apply custom date range
        if (from && fileDate < new Date(from)) return false;
        if (to && fileDate > new Date(to)) return false;

        return true;
      } catch {
        return false;
      }
    });
  }

  /**
   * Filter files by service/folder
   */
  filterByService(files, serviceFilter) {
    return files.filter((file) => {
      const pathParts = file.key.split("/");
      const folder = pathParts[0]; // production-logs, external-logs, etc.
      return folder.toLowerCase().includes(serviceFilter.toLowerCase());
    });
  }

  /**
   * Filter files by filename pattern (supports regex)
   */
  filterByFileName(files, pattern) {
    try {
      const regex = new RegExp(pattern, "i"); // Case insensitive
      return files.filter((file) => {
        const fileName = file.key.split("/").pop(); // Get just the filename
        return regex.test(fileName);
      });
    } catch {
      // If regex is invalid, use simple string matching
      return files.filter((file) => {
        const fileName = file.key.split("/").pop().toLowerCase();
        return fileName.includes(pattern.toLowerCase());
      });
    }
  }

  /**
   * Filter files by size range (in bytes)
   */
  filterBySize(files, sizeRange) {
    const { min, max } = sizeRange;

    return files.filter((file) => {
      if (min && file.size < min) return false;
      if (max && file.size > max) return false;
      return true;
    });
  }

  /**
   * Filter files by extensions
   */
  filterByExtensions(files, extensions) {
    const normalizedExts = extensions.map((ext) =>
      ext.toLowerCase().replace(".", "")
    );

    return files.filter((file) => {
      const fileName = file.key.split("/").pop();
      const fileExt = fileName.split(".").pop().toLowerCase();
      return normalizedExts.includes(fileExt);
    });
  }

  /**
   * Sort files by different criteria
   */
  sortFiles(files, sortBy, sortOrder = "desc") {
    return files.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.key.localeCompare(b.key);
          break;
        case "size":
          comparison = a.size - b.size;
          break;
        case "lastModified":
        default:
          comparison = new Date(a.lastModified) - new Date(b.lastModified);
          break;
      }

      return sortOrder === "desc" ? -comparison : comparison;
    });
  }

  /**
   * Get file details with metadata
   */
  async getFileDetails(userId, fileKey) {
    try {
      // Validate access
      await this.checkFilePermission(fileKey, userId, "read");

      // Get file metadata from S3
      const params = {
        Bucket: this.bucket,
        Key: fileKey,
      };

      const metadata = await this.s3.headObject(params).promise();

      // Extract additional info from file path
      const pathParts = fileKey.split("/");
      const fileName = pathParts.pop();
      const folder = pathParts.join("/");
      const dateFolder = pathParts[1]; // Date from path

      const fileDetails = {
        key: fileKey,
        fileName,
        folder,
        size: metadata.ContentLength,
        lastModified: metadata.LastModified,
        contentType: metadata.ContentType,
        etag: metadata.ETag,
        dateFolder,
        accessible: true,
        metadata: metadata.Metadata || {},
      };

      console.log(`📄 File details retrieved for: ${fileKey}`);

      return {
        success: true,
        file: fileDetails,
      };
    } catch (error) {
      console.error(`❌ Failed to get file details for ${fileKey}:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Search files by content (if they are text files)
   */
  async searchFileContent(
    userId,
    searchTerm,
    fileTypes = ["json", "txt", "log"]
  ) {
    try {
      console.log(`🔍 Searching file content for term: "${searchTerm}"`);

      // Get text files only
      const searchOptions = {
        fileExtensions: fileTypes,
        limit: 50, // Limit for content search
      };

      const filesResult = await this.searchFiles(userId, searchOptions);

      if (!filesResult.success) {
        return filesResult;
      }

      const matchingFiles = [];

      // Search in each file (limited to prevent performance issues)
      for (const file of filesResult.files.slice(0, 20)) {
        try {
          // Get secure download URL
          const urlResult = await this.generatePresignedUrl(file.key, {
            userId,
            expiration: 60, // 1 minute for content search
          });

          // Download and search content (simplified - you'd want to stream large files)
          const response = await fetch(urlResult.url);
          const content = await response.text();

          if (content.toLowerCase().includes(searchTerm.toLowerCase())) {
            matchingFiles.push({
              ...file,
              matchFound: true,
              snippet: this.extractSnippet(content, searchTerm),
            });
          }
        } catch (error) {
          console.error(`❌ Error searching content in ${file.key}:`, error);
        }
      }

      return {
        success: true,
        searchTerm,
        matchingFiles,
        totalSearched: Math.min(filesResult.files.length, 20),
        note: "Content search limited to 20 files for performance",
      };
    } catch (error) {
      console.error(`❌ Content search failed:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Extract snippet around search term
   */
  extractSnippet(content, searchTerm, snippetLength = 200) {
    const index = content.toLowerCase().indexOf(searchTerm.toLowerCase());
    if (index === -1) return "";

    const start = Math.max(0, index - snippetLength / 2);
    const end = Math.min(
      content.length,
      index + searchTerm.length + snippetLength / 2
    );

    let snippet = content.substring(start, end);

    // Add ellipsis if truncated
    if (start > 0) snippet = "..." + snippet;
    if (end < content.length) snippet = snippet + "...";

    return snippet;
  }

  /**
   * Get aggregated statistics
   */
  async getFileStatistics(userId, folder = "") {
    try {
      const files = await this.listAccessibleFiles(userId, folder);

      const stats = {
        totalFiles: files.length,
        totalSize: files.reduce((sum, file) => sum + file.size, 0),
        averageSize:
          files.length > 0
            ? Math.round(
                files.reduce((sum, file) => sum + file.size, 0) / files.length
              )
            : 0,
        fileTypes: {},
        sizeBuckets: {
          small: 0, // < 1MB
          medium: 0, // 1MB - 10MB
          large: 0, // > 10MB
        },
        dateDistribution: {},
      };

      // Analyze files
      files.forEach((file) => {
        // File type distribution
        const ext = file.key.split(".").pop().toLowerCase();
        stats.fileTypes[ext] = (stats.fileTypes[ext] || 0) + 1;

        // Size distribution
        const sizeMB = file.size / (1024 * 1024);
        if (sizeMB < 1) stats.sizeBuckets.small++;
        else if (sizeMB <= 10) stats.sizeBuckets.medium++;
        else stats.sizeBuckets.large++;

        // Date distribution
        try {
          const pathParts = file.key.split("/");
          const dateFolder = pathParts[1];
          stats.dateDistribution[dateFolder] =
            (stats.dateDistribution[dateFolder] || 0) + 1;
        } catch {}
      });

      // Format total size
      stats.totalSizeFormatted = this.formatFileSize(stats.totalSize);
      stats.averageSizeFormatted = this.formatFileSize(stats.averageSize);

      return {
        success: true,
        statistics: stats,
      };
    } catch (error) {
      console.error(`❌ Failed to get file statistics:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Format file size in human readable format
   */
  formatFileSize(bytes) {
    const sizes = ["B", "KB", "MB", "GB"];
    if (bytes === 0) return "0 B";

    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  }
}

module.exports = { S3FileSearchManager };
