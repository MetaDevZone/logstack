/**
 * 🔍 Search & Filter Practical Examples
 * Step-by-step demonstration of how search and filtering works
 */

const {
  searchFiles,
  getFileStatistics,
  searchFileContent,
} = require("./production-setup");

class SearchFilterDemo {
  constructor() {
    this.userId = "demo-user-123";
  }

  async demonstrateFiltering() {
    console.log("🎯 File Search & Filter Step-by-Step Demo\n");
    console.log("=".repeat(60));

    // Step 1: Basic search (no filters)
    console.log("\n📋 STEP 1: Basic Search (No Filters)");
    console.log("-".repeat(40));

    const basicSearch = {
      limit: 5,
      sortBy: "lastModified",
      sortOrder: "desc",
    };

    console.log("🔍 Search Parameters:");
    console.log(JSON.stringify(basicSearch, null, 2));

    const basicResult = await this.mockSearch(basicSearch);
    this.explainFiltering("Basic Search", basicResult, basicSearch);

    // Step 2: Date Range Filter
    console.log("\n📅 STEP 2: Date Range Filtering");
    console.log("-".repeat(40));

    const dateSearch = {
      dateRange: {
        from: "2025-09-01",
        to: "2025-09-04",
      },
      limit: 5,
    };

    console.log("🔍 Search Parameters:");
    console.log(JSON.stringify(dateSearch, null, 2));

    const dateResult = await this.mockSearch(dateSearch);
    this.explainFiltering("Date Range Filter", dateResult, dateSearch);

    // Step 3: Service Filter
    console.log("\n🏷️  STEP 3: Service/Folder Filtering");
    console.log("-".repeat(40));

    const serviceSearch = {
      serviceFilter: "api",
      limit: 3,
    };

    console.log("🔍 Search Parameters:");
    console.log(JSON.stringify(serviceSearch, null, 2));

    const serviceResult = await this.mockSearch(serviceSearch);
    this.explainFiltering("Service Filter", serviceResult, serviceSearch);

    // Step 4: File Extension Filter
    console.log("\n📄 STEP 4: File Extension Filtering");
    console.log("-".repeat(40));

    const extensionSearch = {
      fileExtensions: ["json", "gz"],
      limit: 4,
    };

    console.log("🔍 Search Parameters:");
    console.log(JSON.stringify(extensionSearch, null, 2));

    const extensionResult = await this.mockSearch(extensionSearch);
    this.explainFiltering("Extension Filter", extensionResult, extensionSearch);

    // Step 5: Size Range Filter
    console.log("\n📏 STEP 5: File Size Filtering");
    console.log("-".repeat(40));

    const sizeSearch = {
      sizeRange: {
        min: 1024, // 1KB minimum
        max: 1048576, // 1MB maximum
      },
      limit: 3,
    };

    console.log("🔍 Search Parameters:");
    console.log(JSON.stringify(sizeSearch, null, 2));

    const sizeResult = await this.mockSearch(sizeSearch);
    this.explainFiltering("Size Filter", sizeResult, sizeSearch);

    // Step 6: Filename Pattern Filter
    console.log("\n🔤 STEP 6: Filename Pattern Filtering (Regex)");
    console.log("-".repeat(40));

    const patternSearch = {
      fileNamePattern: "hour-.*\\.json", // Files like "hour-14-15.json"
      limit: 3,
    };

    console.log("🔍 Search Parameters:");
    console.log(JSON.stringify(patternSearch, null, 2));

    const patternResult = await this.mockSearch(patternSearch);
    this.explainFiltering("Pattern Filter", patternResult, patternSearch);

    // Step 7: Combined Filters
    console.log("\n⚡ STEP 7: Combined Multiple Filters");
    console.log("-".repeat(40));

    const combinedSearch = {
      dateRange: {
        from: "2025-09-03",
        to: "2025-09-04",
      },
      serviceFilter: "production",
      fileExtensions: ["json"],
      sizeRange: {
        min: 2048,
        max: 5242880, // 5MB
      },
      fileNamePattern: "hour-.*",
      sortBy: "size",
      sortOrder: "desc",
      limit: 3,
    };

    console.log("🔍 Search Parameters (Combined):");
    console.log(JSON.stringify(combinedSearch, null, 2));

    const combinedResult = await this.mockSearch(combinedSearch);
    this.explainFiltering("Combined Filters", combinedResult, combinedSearch);

    // Step 8: Sorting Examples
    console.log("\n📊 STEP 8: Different Sorting Options");
    console.log("-".repeat(40));

    const sortingExamples = [
      {
        sortBy: "lastModified",
        sortOrder: "desc",
        description: "Newest first",
      },
      { sortBy: "lastModified", sortOrder: "asc", description: "Oldest first" },
      { sortBy: "size", sortOrder: "desc", description: "Largest first" },
      { sortBy: "size", sortOrder: "asc", description: "Smallest first" },
      { sortBy: "name", sortOrder: "asc", description: "Alphabetical" },
    ];

    for (const sortExample of sortingExamples) {
      console.log(`\n🔄 Sorting: ${sortExample.description}`);
      const sortResult = await this.mockSearch({
        ...sortExample,
        limit: 2,
      });

      console.log(
        `✅ Result: ${sortResult.files.length} files sorted by ${sortExample.sortBy} (${sortExample.sortOrder})`
      );
      if (sortResult.files.length > 0) {
        sortResult.files.forEach((file, index) => {
          console.log(
            `   ${index + 1}. ${file.fileName} - ${
              file.sizeFormatted
            } - ${new Date(file.lastModified).toLocaleString()}`
          );
        });
      }
    }

    // Step 9: Pagination Example
    console.log("\n📄 STEP 9: Pagination Example");
    console.log("-".repeat(40));

    const paginationSearch = {
      limit: 3,
      offset: 0,
      sortBy: "lastModified",
    };

    console.log("Page 1 (offset: 0, limit: 3):");
    const page1 = await this.mockSearch(paginationSearch);
    console.log(
      `✅ Found ${page1.totalCount} total files, showing ${page1.files.length}`
    );

    console.log("\nPage 2 (offset: 3, limit: 3):");
    const page2 = await this.mockSearch({
      ...paginationSearch,
      offset: 3,
    });
    console.log(`✅ Page 2: showing ${page2.files.length} files`);

    console.log(`\n📊 Pagination Info:`);
    console.log(`   - Total Files: ${page1.totalCount}`);
    console.log(`   - Page Size: ${paginationSearch.limit}`);
    console.log(
      `   - Total Pages: ${Math.ceil(
        page1.totalCount / paginationSearch.limit
      )}`
    );
    console.log(`   - Has More: ${page1.hasMore}`);

    console.log("\n✅ Search & Filter Demo Complete!");
  }

  explainFiltering(title, result, searchParams) {
    console.log(`\n🎯 ${title} Process:`);
    console.log("   1. User provides search parameters");
    console.log("   2. System validates user permissions");
    console.log("   3. Fetches all accessible files from S3");
    console.log("   4. Applies filters step by step:");

    if (searchParams.dateRange) {
      console.log(
        `      📅 Date Filter: ${searchParams.dateRange.from} to ${searchParams.dateRange.to}`
      );
    }

    if (searchParams.serviceFilter) {
      console.log(`      🏷️  Service Filter: "${searchParams.serviceFilter}"`);
    }

    if (searchParams.fileNamePattern) {
      console.log(`      🔤 Pattern Filter: "${searchParams.fileNamePattern}"`);
    }

    if (searchParams.fileExtensions && searchParams.fileExtensions.length > 0) {
      console.log(
        `      📄 Extension Filter: [${searchParams.fileExtensions.join(", ")}]`
      );
    }

    if (searchParams.sizeRange) {
      const { min, max } = searchParams.sizeRange;
      console.log(
        `      📏 Size Filter: ${min ? this.formatBytes(min) : "0"} - ${
          max ? this.formatBytes(max) : "∞"
        }`
      );
    }

    console.log(
      `   5. Sorts results by: ${searchParams.sortBy || "lastModified"} (${
        searchParams.sortOrder || "desc"
      })`
    );
    console.log(
      `   6. Applies pagination: ${searchParams.limit || 100} results`
    );

    console.log(
      `\n✅ Final Result: ${result.totalCount} total files, ${result.files.length} returned`
    );

    if (result.files.length > 0) {
      console.log("   📁 Sample files:");
      result.files.slice(0, 2).forEach((file, index) => {
        console.log(
          `      ${index + 1}. ${file.fileName} (${file.sizeFormatted})`
        );
      });
    }
  }

  // Mock search function for demonstration
  async mockSearch(searchParams) {
    // Generate mock files
    const mockFiles = this.generateMockFiles(50);

    // Apply filters step by step (same logic as real implementation)
    let filteredFiles = [...mockFiles];

    // Date range filter
    if (searchParams.dateRange) {
      const { from, to } = searchParams.dateRange;
      filteredFiles = filteredFiles.filter((file) => {
        const fileDate = new Date(file.lastModified);
        if (from && fileDate < new Date(from)) return false;
        if (to && fileDate > new Date(to + "T23:59:59.999Z")) return false;
        return true;
      });
    }

    // Service filter
    if (searchParams.serviceFilter) {
      filteredFiles = filteredFiles.filter((file) => {
        const pathParts = file.key.split("/");
        const folder = pathParts[0];
        return folder
          .toLowerCase()
          .includes(searchParams.serviceFilter.toLowerCase());
      });
    }

    // Extension filter
    if (searchParams.fileExtensions && searchParams.fileExtensions.length > 0) {
      filteredFiles = filteredFiles.filter((file) => {
        const fileName = file.key.split("/").pop();
        const fileExt = fileName.split(".").pop().toLowerCase();
        return searchParams.fileExtensions
          .map((ext) => ext.toLowerCase())
          .includes(fileExt);
      });
    }

    // Size filter
    if (searchParams.sizeRange) {
      const { min, max } = searchParams.sizeRange;
      filteredFiles = filteredFiles.filter((file) => {
        if (min && file.size < min) return false;
        if (max && file.size > max) return false;
        return true;
      });
    }

    // Pattern filter
    if (searchParams.fileNamePattern) {
      try {
        const regex = new RegExp(searchParams.fileNamePattern, "i");
        filteredFiles = filteredFiles.filter((file) => {
          const fileName = file.key.split("/").pop();
          return regex.test(fileName);
        });
      } catch {
        // Fallback to simple string matching
        filteredFiles = filteredFiles.filter((file) => {
          const fileName = file.key.split("/").pop().toLowerCase();
          return fileName.includes(searchParams.fileNamePattern.toLowerCase());
        });
      }
    }

    // Sorting
    const sortBy = searchParams.sortBy || "lastModified";
    const sortOrder = searchParams.sortOrder || "desc";

    filteredFiles.sort((a, b) => {
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

    // Pagination
    const limit = searchParams.limit || 100;
    const offset = searchParams.offset || 0;
    const totalCount = filteredFiles.length;

    const paginatedFiles = filteredFiles.slice(offset, offset + limit);

    return {
      success: true,
      files: paginatedFiles,
      totalCount,
      hasMore: offset + limit < totalCount,
      searchParams,
    };
  }

  generateMockFiles(count) {
    const services = ["production", "api", "database", "monitoring"];
    const files = [];

    for (let i = 0; i < count; i++) {
      const service = services[i % services.length];
      const date = new Date(
        Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
      );
      const dateStr = date.toISOString().split("T")[0];
      const hour = Math.floor(Math.random() * 12) * 2;

      const fileName = `hour-${hour.toString().padStart(2, "0")}-${(hour + 2)
        .toString()
        .padStart(2, "0")}.json`;
      const key = `${service}-logs/${dateStr.replace(/-/g, "/")}/${fileName}`;
      const size = Math.floor(Math.random() * 10485760) + 512; // 512B to 10MB

      files.push({
        key,
        fileName,
        size,
        sizeFormatted: this.formatBytes(size),
        lastModified: date.toISOString(),
        service,
      });
    }

    return files;
  }

  formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }
}

// API Example
function demonstrateAPIFiltering() {
  console.log("\n🌐 API Filtering Examples:");
  console.log("=".repeat(50));

  const examples = [
    {
      title: "Basic Search API",
      endpoint: "POST /api/files/search",
      body: {
        limit: 10,
        sortBy: "lastModified",
        sortOrder: "desc",
      },
    },
    {
      title: "Date Range Filter API",
      endpoint: "POST /api/files/search",
      body: {
        dateRange: {
          from: "2025-09-01",
          to: "2025-09-04",
        },
        limit: 20,
      },
    },
    {
      title: "Complex Filter API",
      endpoint: "POST /api/files/search",
      body: {
        dateRange: { from: "2025-09-03", to: "2025-09-04" },
        serviceFilter: "production",
        fileExtensions: ["json", "gz"],
        sizeRange: { min: 1024, max: 5242880 },
        fileNamePattern: "hour-.*",
        sortBy: "size",
        sortOrder: "desc",
        limit: 15,
      },
    },
    {
      title: "Quick Search API",
      endpoint: "GET /api/files/quick-search",
      query: "?q=hour-14&date=2025-09-04&ext=json&limit=5",
    },
  ];

  examples.forEach((example, index) => {
    console.log(`\n${index + 1}. ${example.title}:`);
    console.log(`   Endpoint: ${example.endpoint}`);

    if (example.body) {
      console.log(`   Body:`);
      console.log(JSON.stringify(example.body, null, 6).replace(/^/gm, "   "));
    }

    if (example.query) {
      console.log(`   Query: ${example.query}`);
    }
  });
}

// Content Search Example
function demonstrateContentSearch() {
  console.log("\n📄 Content Search Example:");
  console.log("=".repeat(40));

  console.log(`
🔍 Content Search Process:

1. User provides search term: "error 500"
2. System searches in specified file types: ["json", "log"]
3. For each file:
   - Downloads file content
   - Searches for the term
   - Extracts context around matches
   - Returns matching files with context

Example API Call:
POST /api/files/search-content
{
  "searchTerm": "error 500",
  "fileTypes": ["json", "log"],
  "limit": 10
}

Response:
{
  "success": true,
  "matches": [
    {
      "fileName": "hour-14-15.json",
      "key": "production-logs/2025/09/04/hour-14-15.json",
      "context": "...HTTP 500 Internal Server Error occurred...",
      "line": 42,
      "service": "production"
    }
  ],
  "totalMatches": 1,
  "searchTerm": "error 500"
}
`);
}

// Run demo if called directly
if (require.main === module) {
  const demo = new SearchFilterDemo();
  demo
    .demonstrateFiltering()
    .then(() => {
      demonstrateAPIFiltering();
      demonstrateContentSearch();
    })
    .catch(console.error);
}

module.exports = SearchFilterDemo;
