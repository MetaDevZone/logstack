/**
 * 🧪 S3 Security Test Example
 * Test secure file access functionality
 */

const express = require("express");
const { setupSecureFileAccess } = require("./secure-file-api");
const {
  initializeLogStack,
  initializeS3Security,
} = require("./production-setup");

// Create Express app
const app = express();
app.use(express.json());

// Setup CORS for testing
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

async function startSecurityTest() {
  try {
    console.log("🧪 Starting S3 Security Test...");

    // Initialize LogStack and S3 Security
    await initializeLogStack();
    initializeS3Security();

    // Setup secure file access endpoints
    setupSecureFileAccess(app);

    // Test endpoint to simulate file upload
    app.post("/api/test/upload-log", async (req, res) => {
      try {
        const { message, level = "info" } = req.body;

        const { logAppEvent } = require("./production-setup");
        await logAppEvent(level, message, {
          service: "security-test",
          testData: true,
          timestamp: new Date(),
        });

        res.json({
          success: true,
          message: "Test log uploaded successfully",
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    // Demo endpoint for testing without authentication
    app.get("/api/demo/security-test", async (req, res) => {
      res.json({
        message: "🔐 S3 Security Demo",
        endpoints: [
          "POST /api/files/generate-token - Generate access token",
          "POST /api/files/download-url - Get secure download URL",
          "GET  /api/files/list - List accessible files",
          "POST /api/files/revoke-token - Revoke access token",
        ],
        testSteps: [
          "1. First authenticate with your system to get Bearer token",
          "2. Use Bearer token to generate access token",
          "3. Use access token to get secure file URLs",
          "4. Download files using pre-signed URLs (expires in 1 hour)",
          "5. Revoke access tokens when done",
        ],
        note: "All file access is logged and monitored for security",
      });
    });

    // Health check endpoint
    app.get("/health", (req, res) => {
      res.json({
        status: "healthy",
        service: "logstack-s3-security",
        timestamp: new Date(),
        features: {
          s3Security: true,
          preSignedUrls: true,
          accessControl: true,
          tokenManagement: true,
        },
      });
    });

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`🚀 S3 Security Test Server running on port ${PORT}`);
      console.log("");
      console.log("📋 Available Endpoints:");
      console.log(`   GET  http://localhost:${PORT}/health`);
      console.log(`   GET  http://localhost:${PORT}/api/demo/security-test`);
      console.log(`   POST http://localhost:${PORT}/api/test/upload-log`);
      console.log(`   POST http://localhost:${PORT}/api/files/generate-token`);
      console.log(`   POST http://localhost:${PORT}/api/files/download-url`);
      console.log(`   GET  http://localhost:${PORT}/api/files/list`);
      console.log(`   POST http://localhost:${PORT}/api/files/revoke-token`);
      console.log("");
      console.log("🔑 Authentication Required:");
      console.log("   Add header: Authorization: Bearer YOUR_TOKEN");
      console.log("   (Mock auth is enabled for testing)");
      console.log("");
      console.log("🛡️ Security Features Enabled:");
      console.log("   ✅ Pre-signed URLs (1 hour expiration)");
      console.log("   ✅ Access token management");
      console.log("   ✅ User permission checking");
      console.log("   ✅ File access logging");
      console.log("   ✅ Date-based access control");
    });
  } catch (error) {
    console.error("❌ Failed to start security test:", error);
    process.exit(1);
  }
}

// Test helper functions
const testHelpers = {
  // Generate test authentication token
  generateTestAuthToken() {
    // In real app, this would be your JWT or session token
    return "test_auth_token_12345";
  },

  // Test the complete flow
  async testCompleteFlow() {
    console.log("🧪 Testing complete security flow...");

    const baseUrl = "http://localhost:4000";
    const authToken = this.generateTestAuthToken();

    try {
      // Step 1: Generate access token
      console.log("1️⃣ Generating access token...");
      const tokenResponse = await fetch(`${baseUrl}/api/files/generate-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ permissions: ["read"] }),
      });

      const tokenData = await tokenResponse.json();
      console.log("✅ Access token generated:", tokenData.accessToken);

      // Step 2: List accessible files
      console.log("2️⃣ Listing accessible files...");
      const listResponse = await fetch(`${baseUrl}/api/files/list`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const listData = await listResponse.json();
      console.log("✅ Accessible files:", listData.count);

      // Step 3: Get secure URL for first file (if exists)
      if (listData.files && listData.files.length > 0) {
        console.log("3️⃣ Getting secure download URL...");
        const fileName = listData.files[0].key;

        const urlResponse = await fetch(`${baseUrl}/api/files/download-url`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            fileName,
            accessToken: tokenData.accessToken,
          }),
        });

        const urlData = await urlResponse.json();
        console.log(
          "✅ Secure URL generated:",
          urlData.downloadUrl ? "Success" : "Failed"
        );
      }

      // Step 4: Revoke access token
      console.log("4️⃣ Revoking access token...");
      const revokeResponse = await fetch(`${baseUrl}/api/files/revoke-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          accessToken: tokenData.accessToken,
        }),
      });

      const revokeData = await revokeResponse.json();
      console.log("✅ Access token revoked:", revokeData.success);

      console.log("🎉 Complete security flow test successful!");
    } catch (error) {
      console.error("❌ Security flow test failed:", error);
    }
  },
};

// Start server if run directly
if (require.main === module) {
  startSecurityTest().catch(console.error);
}

module.exports = {
  startSecurityTest,
  testHelpers,
};
