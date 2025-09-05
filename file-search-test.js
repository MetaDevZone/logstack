/**
 * 🔍 File Search & Filter Test Example
 * Complete testing for file search functionality
 */

const express = require("express");
const { setupSecureFileAccess } = require("./secure-file-api");
const { setupFileSearchAPI } = require("./file-search-api");
const {
  initializeLogStack,
  initializeS3Security,
  initializeFileSearch,
  searchFiles,
  getFileDetails,
  searchFileContent,
  getFileStatistics,
  productionConfig,
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

// Mock authentication middleware for testing
app.use((req, res, next) => {
  // Add mock user for testing
  req.user = { id: "test-user-123", name: "Test User" };
  next();
});

async function startFileSearchTest() {
  try {
    console.log("🧪 Starting File Search & Filter Test...");

    // Initialize LogStack components
    await initializeLogStack();
    initializeS3Security();
    initializeFileSearch();

    // Setup secure file access endpoints
    setupSecureFileAccess(app);

    // Setup file search endpoints
    setupFileSearchAPI(app, productionConfig.s3);

    // Demo endpoints for testing
    setupDemoEndpoints();

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`🚀 File Search Test Server running on port ${PORT}`);
      printAvailableEndpoints(PORT);
    });
  } catch (error) {
    console.error("❌ Failed to start file search test:", error);
    process.exit(1);
  }
}

function setupDemoEndpoints() {
  // Demo search endpoint
  app.get("/api/demo/search-examples", (req, res) => {
    res.json({
      message: "🔍 File Search & Filter Examples",

      basicSearch: {
        endpoint: "POST /api/files/search",
        description: "Advanced file search with multiple filters",
        example: {
          dateRange: { from: "2025-09-01", to: "2025-09-04" },
          serviceFilter: "production",
          fileNamePattern: "hour-.*\\.json",
          sizeRange: { min: 1024, max: 1048576 },
          fileExtensions: ["json", "gz"],
          sortBy: "lastModified",
          sortOrder: "desc",
          limit: 50,
          offset: 0,
        },
      },

      quickSearch: {
        endpoint: "GET /api/files/quick-search",
        description: "Quick search with URL parameters",
        examples: [
          "/api/files/quick-search?q=hour-14&date=2025-09-04",
          "/api/files/quick-search?service=production&ext=json&limit=10",
          "/api/files/quick-search?q=error&date=2025-09-04",
        ],
      },

      contentSearch: {
        endpoint: "POST /api/files/search-content",
        description: "Search within file content",
        example: {
          searchTerm: "error 500",
          fileTypes: ["json", "log"],
        },
      },

      fileDetails: {
        endpoint: "GET /api/files/details/{fileKey}",
        description: "Get detailed file information",
        example:
          "/api/files/details/production-logs/2025/09/04/hour-14-15.json.gz",
      },

      statistics: {
        endpoint: "GET /api/files/statistics",
        description: "Get file statistics and analytics",
        example: "/api/files/statistics?folder=production-logs",
      },
    });
  });

  // Test file upload for demo
  app.post("/api/demo/upload-test-log", async (req, res) => {
    try {
      const {
        message,
        level = "info",
        service = "file-search-test",
      } = req.body;

      const { logAppEvent } = require("./production-setup");
      await logAppEvent(level, message || "Test log for file search", {
        service,
        testData: true,
        searchTestId: Date.now(),
        timestamp: new Date(),
      });

      res.json({
        success: true,
        message: "Test log uploaded for file search testing",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  // Test search functions directly
  app.post("/api/demo/test-search-functions", async (req, res) => {
    try {
      const userId = req.user.id;
      const { testType } = req.body;

      let result;

      switch (testType) {
        case "basicSearch":
          result = await searchFiles(userId, {
            limit: 10,
            sortBy: "lastModified",
            sortOrder: "desc",
          });
          break;

        case "dateFilter":
          result = await searchFiles(userId, {
            dateRange: {
              from: "2025-09-04",
              to: "2025-09-04",
            },
            limit: 5,
          });
          break;

        case "extensionFilter":
          result = await searchFiles(userId, {
            fileExtensions: ["json"],
            limit: 5,
          });
          break;

        case "statistics":
          result = await getFileStatistics(userId);
          break;

        default:
          result = { error: "Unknown test type" };
      }

      res.json({
        success: true,
        testType,
        result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
}

function printAvailableEndpoints(port) {
  console.log("");
  console.log("📋 Available Endpoints:");
  console.log("");

  console.log("🔍 File Search Endpoints:");
  console.log(`   POST http://localhost:${port}/api/files/search`);
  console.log(`   GET  http://localhost:${port}/api/files/quick-search`);
  console.log(`   POST http://localhost:${port}/api/files/search-content`);
  console.log(`   GET  http://localhost:${port}/api/files/details/{fileKey}`);
  console.log(`   GET  http://localhost:${port}/api/files/statistics`);
  console.log("");

  console.log("🔐 Secure File Access:");
  console.log(`   POST http://localhost:${port}/api/files/generate-token`);
  console.log(`   POST http://localhost:${port}/api/files/download-url`);
  console.log(`   GET  http://localhost:${port}/api/files/list`);
  console.log(`   POST http://localhost:${port}/api/files/revoke-token`);
  console.log("");

  console.log("🧪 Demo & Testing:");
  console.log(`   GET  http://localhost:${port}/api/demo/search-examples`);
  console.log(`   POST http://localhost:${port}/api/demo/upload-test-log`);
  console.log(
    `   POST http://localhost:${port}/api/demo/test-search-functions`
  );
  console.log(`   GET  http://localhost:${port}/health`);
  console.log("");

  console.log("💡 Example Usage:");
  console.log("");
  console.log("# Quick search for JSON files from today:");
  console.log(
    `curl "http://localhost:${port}/api/files/quick-search?q=hour&date=2025-09-04&ext=json&limit=5"`
  );
  console.log("");
  console.log("# Advanced search with filters:");
  console.log(`curl -X POST http://localhost:${port}/api/files/search \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(
    `  -d '{"fileExtensions":["json"],"limit":10,"sortBy":"lastModified"}'`
  );
  console.log("");
  console.log("# Get file statistics:");
  console.log(`curl "http://localhost:${port}/api/files/statistics"`);
  console.log("");

  console.log("🔑 Note: Mock authentication enabled for testing");
  console.log("   All requests automatically authenticated as test-user-123");
}

// Helper functions for manual testing
const testHelpers = {
  // Test basic search functionality
  async testBasicSearch() {
    console.log("🧪 Testing basic search...");

    try {
      const result = await searchFiles("test-user-123", {
        limit: 5,
        sortBy: "lastModified",
      });

      console.log("✅ Basic search result:", {
        success: result.success,
        totalFiles: result.totalCount,
        returnedFiles: result.files?.length,
      });

      return result;
    } catch (error) {
      console.error("❌ Basic search failed:", error);
    }
  },

  // Test search with filters
  async testFilteredSearch() {
    console.log("🧪 Testing filtered search...");

    try {
      const result = await searchFiles("test-user-123", {
        fileExtensions: ["json"],
        dateRange: {
          from: "2025-09-01",
          to: "2025-09-04",
        },
        limit: 3,
        sortBy: "size",
        sortOrder: "desc",
      });

      console.log("✅ Filtered search result:", {
        success: result.success,
        totalFiles: result.totalCount,
        filters: "JSON files, Sept 1-4, sorted by size",
      });

      return result;
    } catch (error) {
      console.error("❌ Filtered search failed:", error);
    }
  },

  // Test statistics
  async testStatistics() {
    console.log("🧪 Testing file statistics...");

    try {
      const result = await getFileStatistics("test-user-123");

      console.log("✅ Statistics result:", {
        success: result.success,
        totalFiles: result.statistics?.totalFiles,
        totalSize: result.statistics?.totalSizeFormatted,
      });

      return result;
    } catch (error) {
      console.error("❌ Statistics failed:", error);
    }
  },
};

// Start server if run directly
if (require.main === module) {
  startFileSearchTest().catch(console.error);
}

module.exports = {
  startFileSearchTest,
  testHelpers,
};
