/**
 * 🎯 Complete File Search Demo
 * Practical examples showing all search and filter capabilities
 */

const {
  initializeLogStack,
  initializeS3Security,
  initializeFileSearch,
  searchFiles,
  getFileDetails,
  searchFileContent,
  getFileStatistics,
  logAppEvent,
} = require("./production-setup");

class FileSearchDemo {
  constructor() {
    this.userId = "demo-user-123";
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    console.log("🔧 Initializing LogStack components...");
    await initializeLogStack();
    initializeS3Security();
    initializeFileSearch();
    this.isInitialized = true;
    console.log("✅ Initialization complete");
  }

  async createSampleData() {
    console.log("📝 Creating sample log data for demonstration...");

    const sampleLogs = [
      { level: "info", message: "User login successful", service: "auth" },
      {
        level: "error",
        message: "Database connection failed",
        service: "database",
      },
      {
        level: "warn",
        message: "High memory usage detected",
        service: "monitoring",
      },
      { level: "info", message: "API request processed", service: "api" },
      {
        level: "error",
        message: "Payment processing error",
        service: "payment",
      },
      {
        level: "info",
        message: "Cache cleared successfully",
        service: "cache",
      },
      { level: "debug", message: "Debug trace information", service: "debug" },
    ];

    for (const log of sampleLogs) {
      await logAppEvent(log.level, log.message, {
        service: log.service,
        timestamp: new Date(),
        demo: true,
        userId: this.userId,
      });

      // Small delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(`✅ Created ${sampleLogs.length} sample log entries`);
  }

  async demonstrateBasicSearch() {
    console.log("\n🔍 === BASIC SEARCH DEMO ===");

    try {
      // Basic search - get recent files
      console.log("1. Basic search (recent files):");
      const basicResult = await searchFiles(this.userId, {
        limit: 5,
        sortBy: "lastModified",
        sortOrder: "desc",
      });

      this.printSearchResult(basicResult, "Basic Search");

      // Search with file extension filter
      console.log("\n2. Filter by file extension (JSON only):");
      const jsonResult = await searchFiles(this.userId, {
        fileExtensions: ["json"],
        limit: 3,
        sortBy: "lastModified",
      });

      this.printSearchResult(jsonResult, "JSON Files Only");
    } catch (error) {
      console.error("❌ Basic search demo failed:", error.message);
    }
  }

  async demonstrateDateFiltering() {
    console.log("\n📅 === DATE FILTERING DEMO ===");

    try {
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      // Today's files
      console.log("1. Today's files:");
      const todayResult = await searchFiles(this.userId, {
        dateRange: {
          from: today,
          to: today,
        },
        limit: 5,
      });

      this.printSearchResult(todayResult, "Today's Files");

      // Last 2 days
      console.log("\n2. Last 2 days:");
      const recentResult = await searchFiles(this.userId, {
        dateRange: {
          from: yesterday,
          to: today,
        },
        limit: 10,
        sortBy: "lastModified",
        sortOrder: "desc",
      });

      this.printSearchResult(recentResult, "Last 2 Days");
    } catch (error) {
      console.error("❌ Date filtering demo failed:", error.message);
    }
  }

  async demonstrateAdvancedFiltering() {
    console.log("\n⚡ === ADVANCED FILTERING DEMO ===");

    try {
      // Complex filter combination
      console.log("1. Advanced filter combination:");
      const advancedResult = await searchFiles(this.userId, {
        fileNamePattern: ".*hour.*", // Files with 'hour' in name
        fileExtensions: ["json", "gz"],
        sizeRange: {
          min: 100, // At least 100 bytes
          max: 10485760, // Max 10MB
        },
        sortBy: "size",
        sortOrder: "desc",
        limit: 5,
      });

      this.printSearchResult(advancedResult, "Advanced Filters");

      // Service-specific search
      console.log("\n2. Service-specific search:");
      const serviceResult = await searchFiles(this.userId, {
        serviceFilter: "api",
        limit: 3,
      });

      this.printSearchResult(serviceResult, "API Service Files");
    } catch (error) {
      console.error("❌ Advanced filtering demo failed:", error.message);
    }
  }

  async demonstrateContentSearch() {
    console.log("\n📄 === CONTENT SEARCH DEMO ===");

    try {
      // Search for error content
      console.log('1. Search for "error" in content:');
      const errorResult = await searchFileContent(this.userId, {
        searchTerm: "error",
        fileTypes: ["json", "log"],
        limit: 5,
      });

      if (errorResult.success && errorResult.matches.length > 0) {
        console.log(`✅ Found ${errorResult.totalMatches} content matches:`);
        errorResult.matches.slice(0, 3).forEach((match, index) => {
          console.log(`   ${index + 1}. ${match.fileName}`);
          console.log(`      Context: ${match.context.substring(0, 80)}...`);
        });
      } else {
        console.log('ℹ️  No content matches found for "error"');
      }

      // Search for specific terms
      console.log('\n2. Search for "success" in content:');
      const successResult = await searchFileContent(this.userId, {
        searchTerm: "success",
        fileTypes: ["json"],
        limit: 3,
      });

      if (successResult.success && successResult.matches.length > 0) {
        console.log(`✅ Found ${successResult.totalMatches} success matches`);
      } else {
        console.log('ℹ️  No content matches found for "success"');
      }
    } catch (error) {
      console.error("❌ Content search demo failed:", error.message);
    }
  }

  async demonstrateFileDetails() {
    console.log("\n📋 === FILE DETAILS DEMO ===");

    try {
      // Get recent files first
      const recentFiles = await searchFiles(this.userId, {
        limit: 3,
        sortBy: "lastModified",
        sortOrder: "desc",
      });

      if (recentFiles.success && recentFiles.files.length > 0) {
        const file = recentFiles.files[0];
        console.log(`1. Getting details for: ${file.fileName}`);

        const details = await getFileDetails(this.userId, file.key);

        if (details.success) {
          console.log("✅ File details:");
          console.log(`   📁 Name: ${details.file.fileName}`);
          console.log(`   📏 Size: ${details.file.sizeFormatted}`);
          console.log(
            `   📅 Modified: ${new Date(
              details.file.lastModified
            ).toLocaleString()}`
          );
          console.log(`   🏷️  Service: ${details.file.service || "N/A"}`);
          console.log(`   📂 Folder: ${details.file.folder}`);

          if (details.metadata) {
            console.log(
              `   🔗 Download URL: Available (expires in ${details.metadata.expiresIn} seconds)`
            );
          }
        } else {
          console.log("❌ Failed to get file details");
        }
      } else {
        console.log("ℹ️  No files found for details demo");
      }
    } catch (error) {
      console.error("❌ File details demo failed:", error.message);
    }
  }

  async demonstrateStatistics() {
    console.log("\n📊 === STATISTICS DEMO ===");

    try {
      console.log("1. Overall file statistics:");
      const stats = await getFileStatistics(this.userId);

      if (stats.success) {
        const s = stats.statistics;
        console.log("✅ File Statistics:");
        console.log(`   📁 Total Files: ${s.totalFiles.toLocaleString()}`);
        console.log(`   💾 Total Size: ${s.totalSizeFormatted}`);
        console.log(
          `   📊 Average Size: ${this.formatBytes(s.averageFileSize)}`
        );

        if (s.dateRange) {
          console.log(
            `   📅 Date Range: ${new Date(
              s.dateRange.earliest
            ).toLocaleDateString()} - ${new Date(
              s.dateRange.latest
            ).toLocaleDateString()}`
          );
        }

        if (s.extensionCounts) {
          console.log("   📄 File Types:");
          Object.entries(s.extensionCounts).forEach(([ext, count]) => {
            console.log(`      .${ext}: ${count} files`);
          });
        }

        if (s.serviceCounts) {
          console.log("   🏷️  Services:");
          Object.entries(s.serviceCounts)
            .slice(0, 5)
            .forEach(([service, count]) => {
              console.log(`      ${service}: ${count} files`);
            });
        }

        if (s.largestFile) {
          console.log(
            `   🎯 Largest File: ${s.largestFile.fileName} (${s.largestFile.sizeFormatted})`
          );
        }
      } else {
        console.log("❌ Failed to get statistics");
      }
    } catch (error) {
      console.error("❌ Statistics demo failed:", error.message);
    }
  }

  async demonstratePagination() {
    console.log("\n📄 === PAGINATION DEMO ===");

    try {
      const limit = 3;

      // First page
      console.log("1. First page (0-2):");
      const page1 = await searchFiles(this.userId, {
        limit: limit,
        offset: 0,
        sortBy: "lastModified",
        sortOrder: "desc",
      });

      this.printSearchResult(page1, "Page 1");

      if (page1.success && page1.totalCount > limit) {
        // Second page
        console.log("\n2. Second page (3-5):");
        const page2 = await searchFiles(this.userId, {
          limit: limit,
          offset: limit,
          sortBy: "lastModified",
          sortOrder: "desc",
        });

        this.printSearchResult(page2, "Page 2");

        console.log(`\n📊 Pagination Summary:`);
        console.log(`   Total Files: ${page1.totalCount}`);
        console.log(`   Page Size: ${limit}`);
        console.log(`   Total Pages: ${Math.ceil(page1.totalCount / limit)}`);
      }
    } catch (error) {
      console.error("❌ Pagination demo failed:", error.message);
    }
  }

  printSearchResult(result, title) {
    if (result.success) {
      console.log(`✅ ${title} (${result.totalCount} total):`);
      if (result.files && result.files.length > 0) {
        result.files.forEach((file, index) => {
          console.log(
            `   ${index + 1}. ${file.fileName} (${
              file.sizeFormatted
            }) - ${new Date(file.lastModified).toLocaleString()}`
          );
        });
      } else {
        console.log("   No files found");
      }
    } else {
      console.log(`❌ ${title} failed: ${result.error}`);
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }

  async runCompleteDemo() {
    console.log("🎯 LogStack File Search & Filter Complete Demo\n");
    console.log("=".repeat(60));

    try {
      await this.initialize();

      // Create some sample data
      await this.createSampleData();

      // Wait a moment for files to be processed
      console.log("\n⏳ Waiting for files to be processed...");
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Run all demonstrations
      await this.demonstrateBasicSearch();
      await this.demonstrateDateFiltering();
      await this.demonstrateAdvancedFiltering();
      await this.demonstrateContentSearch();
      await this.demonstrateFileDetails();
      await this.demonstrateStatistics();
      await this.demonstratePagination();

      console.log("\n✅ Complete demo finished successfully!");
      console.log("\n🎯 Summary of Features Demonstrated:");
      console.log("   ✅ Basic file search with sorting");
      console.log("   ✅ Date range filtering");
      console.log("   ✅ File extension and size filtering");
      console.log("   ✅ Service and pattern filtering");
      console.log("   ✅ Content search within files");
      console.log("   ✅ Detailed file information");
      console.log("   ✅ File statistics and analytics");
      console.log("   ✅ Pagination for large result sets");

      console.log("\n💡 Next Steps:");
      console.log("   1. Run: node file-search-test.js (for API testing)");
      console.log("   2. Use the search functions in your application");
      console.log(
        "   3. Check FILE_SEARCH_GUIDE.md for detailed documentation"
      );
    } catch (error) {
      console.error("❌ Demo failed:", error);
    }
  }
}

// Run demo if called directly
if (require.main === module) {
  const demo = new FileSearchDemo();
  demo.runCompleteDemo().catch(console.error);
}

module.exports = FileSearchDemo;
