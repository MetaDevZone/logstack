/**
 * 🔐 Secure S3 File Access API Endpoints
 * Protected file access with authentication and authorization
 */

const express = require("express");
const {
  initializeS3Security,
  generateUserAccessToken,
  getSecureFileUrl,
  getUserAccessibleFiles,
  revokeUserAccess,
} = require("./production-setup");

// Initialize security on startup
initializeS3Security();

/**
 * Middleware to authenticate user (customize based on your auth system)
 */
function authenticateUser(req, res, next) {
  // Example authentication - replace with your auth logic
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Authentication required",
      message: "Please provide a valid Bearer token",
    });
  }

  // Extract token and validate user
  const token = authHeader.split(" ")[1];

  // Replace this with your actual user validation logic
  try {
    // Example: const user = jwt.verify(token, process.env.JWT_SECRET);
    const user = { id: "user123", name: "John Doe", role: "user" }; // Mock user

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Invalid token",
      message: "Authentication failed",
    });
  }
}

/**
 * Create Express router with secure file access endpoints
 */
function createSecureFileRouter() {
  const router = express.Router();

  // Apply authentication to all routes
  router.use(authenticateUser);

  /**
   * Generate access token for file downloads
   * POST /api/files/generate-token
   */
  router.post("/generate-token", async (req, res) => {
    try {
      const { permissions = ["read"] } = req.body;
      const userId = req.user.id;

      const accessToken = generateUserAccessToken(userId, permissions);

      res.json({
        success: true,
        accessToken,
        userId,
        permissions,
        expiration: Date.now() + 3600 * 1000, // 1 hour
        message: "Access token generated successfully",
      });

      console.log(`🔑 Access token generated for user: ${userId}`);
    } catch (error) {
      console.error("❌ Failed to generate access token:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * Get secure download URL for specific file
   * POST /api/files/download-url
   */
  router.post("/download-url", async (req, res) => {
    try {
      const { fileName, accessToken } = req.body;
      const userId = req.user.id;

      if (!fileName) {
        return res.status(400).json({
          success: false,
          error: "fileName is required",
        });
      }

      const result = await getSecureFileUrl(fileName, userId, accessToken);

      if (!result.success) {
        return res.status(403).json(result);
      }

      res.json(result);

      console.log(`🔗 Secure URL generated for ${fileName} by user: ${userId}`);
    } catch (error) {
      console.error("❌ Failed to generate secure URL:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * List accessible files for user
   * GET /api/files/list
   */
  router.get("/list", async (req, res) => {
    try {
      const { folder = "" } = req.query;
      const userId = req.user.id;

      const result = await getUserAccessibleFiles(userId, folder);

      res.json(result);

      console.log(
        `📁 File list requested by user: ${userId}, folder: ${folder || "root"}`
      );
    } catch (error) {
      console.error("❌ Failed to list files:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * Revoke access token
   * POST /api/files/revoke-token
   */
  router.post("/revoke-token", async (req, res) => {
    try {
      const { accessToken } = req.body;
      const userId = req.user.id;

      if (!accessToken) {
        return res.status(400).json({
          success: false,
          error: "accessToken is required",
        });
      }

      const revoked = revokeUserAccess(accessToken);

      res.json({
        success: revoked,
        message: revoked
          ? "Access token revoked successfully"
          : "Token not found",
      });

      console.log(`🔒 Access token revoked by user: ${userId}`);
    } catch (error) {
      console.error("❌ Failed to revoke token:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  return router;
}

/**
 * Example usage with Express app
 */
function setupSecureFileAccess(app) {
  const secureFileRouter = createSecureFileRouter();

  // Mount the secure file router
  app.use("/api/files", secureFileRouter);

  console.log("🔐 Secure file access endpoints registered:");
  console.log("   POST /api/files/generate-token");
  console.log("   POST /api/files/download-url");
  console.log("   GET  /api/files/list");
  console.log("   POST /api/files/revoke-token");
}

/**
 * Example client usage
 */
const clientExamples = {
  // Generate access token
  generateToken: `
// Generate access token
const response = await fetch('/api/files/generate-token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_AUTH_TOKEN'
  },
  body: JSON.stringify({
    permissions: ['read']
  })
});

const { accessToken } = await response.json();
`,

  // Get secure download URL
  getDownloadUrl: `
// Get secure download URL
const response = await fetch('/api/files/download-url', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_AUTH_TOKEN'
  },
  body: JSON.stringify({
    fileName: 'production-logs/2025/09/04/hour-14-15.json.gz',
    accessToken: 'ACCESS_TOKEN_FROM_PREVIOUS_STEP'
  })
});

const { downloadUrl } = await response.json();

// Now you can use this secure URL to download the file
window.open(downloadUrl, '_blank');
`,

  // List accessible files
  listFiles: `
// List accessible files
const response = await fetch('/api/files/list?folder=production-logs/2025/09/04', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_AUTH_TOKEN'
  }
});

const { files } = await response.json();
console.log('Accessible files:', files);
`,
};

module.exports = {
  createSecureFileRouter,
  setupSecureFileAccess,
  authenticateUser,
  clientExamples,
};
