/**
 * 🔍 File Search & Filter API Endpoints
 * Advanced file search, filtering, and access APIs
 */

const express = require("express");
const { S3FileSearchManager } = require("./lib/s3FileSearch");

// Initialize search manager
let fileSearchManager = null;

/**
 * Initialize file search manager
 */
function initializeFileSearch(s3Config) {
  fileSearchManager = new S3FileSearchManager(s3Config);
  console.log("🔍 File Search Manager initialized");
}

/**
 * Middleware to ensure search manager is initialized
 */
function ensureSearchManager(req, res, next) {
  if (!fileSearchManager) {
    return res.status(500).json({
      success: false,
      error: "File search not initialized",
    });
  }
  next();
}

/**
 * Create file search router
 */
function createFileSearchRouter() {
  const router = express.Router();

  /**
   * Advanced file search with filters
   * POST /api/files/search
   */
  router.post("/search", ensureSearchManager, async (req, res) => {
    try {
      const userId = req.user.id;
      const searchOptions = req.body;

      const result = await fileSearchManager.searchFiles(userId, searchOptions);

      res.json(result);

      console.log(
        `🔍 File search by user: ${userId}, found: ${
          result.totalCount || 0
        } files`
      );
    } catch (error) {
      console.error("❌ File search failed:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * Get file details
   * GET /api/files/details/:fileKey
   */
  router.get("/details/*", ensureSearchManager, async (req, res) => {
    try {
      const userId = req.user.id;
      const fileKey = req.params[0]; // Everything after /details/

      const result = await fileSearchManager.getFileDetails(userId, fileKey);

      res.json(result);
    } catch (error) {
      console.error("❌ Failed to get file details:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * Search file content
   * POST /api/files/search-content
   */
  router.post("/search-content", ensureSearchManager, async (req, res) => {
    try {
      const userId = req.user.id;
      const { searchTerm, fileTypes = ["json", "txt", "log"] } = req.body;

      if (!searchTerm) {
        return res.status(400).json({
          success: false,
          error: "searchTerm is required",
        });
      }

      const result = await fileSearchManager.searchFileContent(
        userId,
        searchTerm,
        fileTypes
      );

      res.json(result);

      console.log(
        `🔍 Content search by user: ${userId}, term: "${searchTerm}"`
      );
    } catch (error) {
      console.error("❌ Content search failed:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * Get file statistics
   * GET /api/files/statistics
   */
  router.get("/statistics", ensureSearchManager, async (req, res) => {
    try {
      const userId = req.user.id;
      const { folder = "" } = req.query;

      const result = await fileSearchManager.getFileStatistics(userId, folder);

      res.json(result);

      console.log(`📊 Statistics requested by user: ${userId}`);
    } catch (error) {
      console.error("❌ Failed to get statistics:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * Quick search endpoint
   * GET /api/files/quick-search
   */
  router.get("/quick-search", ensureSearchManager, async (req, res) => {
    try {
      const userId = req.user.id;
      const { q: query, date, service, ext: extension, limit = 20 } = req.query;

      const searchOptions = {
        limit: parseInt(limit),
      };

      // Add filters based on query params
      if (query) {
        searchOptions.fileNamePattern = query;
      }

      if (date) {
        // Search for specific date (YYYY-MM-DD)
        searchOptions.dateRange = {
          from: date,
          to: date,
        };
      }

      if (service) {
        searchOptions.serviceFilter = service;
      }

      if (extension) {
        searchOptions.fileExtensions = [extension];
      }

      const result = await fileSearchManager.searchFiles(userId, searchOptions);

      res.json(result);

      console.log(
        `⚡ Quick search by user: ${userId}, query: "${query || "all"}"`
      );
    } catch (error) {
      console.error("❌ Quick search failed:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  return router;
}

/**
 * Setup file search with existing secure file API
 */
function setupFileSearchAPI(app, s3Config) {
  // Initialize search functionality
  initializeFileSearch(s3Config);

  // Create and mount search router
  const searchRouter = createFileSearchRouter();
  app.use("/api/files", searchRouter);

  console.log("🔍 File search endpoints registered:");
  console.log("   POST /api/files/search");
  console.log("   GET  /api/files/details/{fileKey}");
  console.log("   POST /api/files/search-content");
  console.log("   GET  /api/files/statistics");
  console.log("   GET  /api/files/quick-search");
}

/**
 * Example usage patterns
 */
const searchExamples = {
  // Advanced search with all filters
  advancedSearch: `
POST /api/files/search
{
  "dateRange": {
    "from": "2025-09-01",
    "to": "2025-09-04"
  },
  "serviceFilter": "production",
  "fileNamePattern": "hour-.*\\.json",
  "sizeRange": {
    "min": 1024,
    "max": 1048576
  },
  "fileExtensions": ["json", "gz"],
  "sortBy": "lastModified",
  "sortOrder": "desc",
  "limit": 50,
  "offset": 0
}
`,

  // Quick search
  quickSearch: `
GET /api/files/quick-search?q=hour-14&date=2025-09-04&service=production&ext=json&limit=10
`,

  // Search file content
  contentSearch: `
POST /api/files/search-content
{
  "searchTerm": "error 500",
  "fileTypes": ["json", "log"]
}
`,

  // Get file details
  fileDetails: `
GET /api/files/details/production-logs/2025/09/04/hour-14-15.json.gz
`,

  // Get statistics
  statistics: `
GET /api/files/statistics?folder=production-logs
`,
};

module.exports = {
  createFileSearchRouter,
  setupFileSearchAPI,
  initializeFileSearch,
  searchExamples,
};
