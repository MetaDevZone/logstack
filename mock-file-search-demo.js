/**
 * 🎯 Mock File Search Demo
 * Demo without AWS - shows functionality with mock data
 */

class MockFileSearchDemo {
  constructor() {
    this.userId = "demo-user-123";
    this.mockFiles = this.generateMockFiles();
  }

  generateMockFiles() {
    const services = [
      "auth",
      "api",
      "database",
      "payment",
      "monitoring",
      "cache",
    ];
    const extensions = ["json", "gz", "log", "txt"];
    const files = [];

    // Generate mock files for last 7 days
    for (let day = 0; day < 7; day++) {
      const date = new Date(Date.now() - day * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];

      for (let hour = 0; hour < 24; hour += 2) {
        for (const service of services) {
          const fileName = `hour-${hour.toString().padStart(2, "0")}-${(
            hour + 2
          )
            .toString()
            .padStart(2, "0")}.json`;
          const key = `${service}-logs/${dateStr.replace(
            /-/g,
            "/"
          )}/${fileName}`;
          const size = Math.floor(Math.random() * 10485760) + 1024; // 1KB to 10MB

          files.push({
            key,
            fileName,
            size,
            sizeFormatted: this.formatBytes(size),
            lastModified: new Date(
              date.getTime() + hour * 60 * 60 * 1000
            ).toISOString(),
            service,
            extension: "json",
            folder: `${service}-logs/${dateStr.replace(/-/g, "/")}`,
          });
        }
      }
    }

    return files.sort(
      (a, b) => new Date(b.lastModified) - new Date(a.lastModified)
    );
  }

  async mockSearchFiles(userId, criteria = {}) {
    let results = [...this.mockFiles];

    // Apply filters
    if (criteria.dateRange) {
      const from = new Date(criteria.dateRange.from);
      const to = new Date(criteria.dateRange.to + "T23:59:59.999Z");
      results = results.filter((file) => {
        const fileDate = new Date(file.lastModified);
        return fileDate >= from && fileDate <= to;
      });
    }

    if (criteria.serviceFilter) {
      results = results.filter(
        (file) => file.service === criteria.serviceFilter
      );
    }

    if (criteria.fileNamePattern) {
      const regex = new RegExp(criteria.fileNamePattern, "i");
      results = results.filter((file) => regex.test(file.fileName));
    }

    if (criteria.fileExtensions) {
      results = results.filter((file) =>
        criteria.fileExtensions.includes(file.extension)
      );
    }

    if (criteria.sizeRange) {
      if (criteria.sizeRange.min) {
        results = results.filter((file) => file.size >= criteria.sizeRange.min);
      }
      if (criteria.sizeRange.max) {
        results = results.filter((file) => file.size <= criteria.sizeRange.max);
      }
    }

    // Apply sorting
    if (criteria.sortBy) {
      results.sort((a, b) => {
        let aVal = a[criteria.sortBy];
        let bVal = b[criteria.sortBy];

        if (criteria.sortBy === "lastModified") {
          aVal = new Date(aVal);
          bVal = new Date(bVal);
        }

        if (criteria.sortOrder === "desc") {
          return bVal > aVal ? 1 : -1;
        } else {
          return aVal > bVal ? 1 : -1;
        }
      });
    }

    const totalCount = results.length;

    // Apply pagination
    const offset = criteria.offset || 0;
    const limit = criteria.limit || 50;
    results = results.slice(offset, offset + limit);

    return {
      success: true,
      files: results,
      totalCount,
      searchCriteria: {
        appliedFilters: Object.keys(criteria).filter(
          (key) => criteria[key] !== undefined
        ),
        sortBy: criteria.sortBy || "lastModified",
        sortOrder: criteria.sortOrder || "desc",
      },
      pagination: {
        limit,
        offset,
        hasMore: offset + results.length < totalCount,
      },
    };
  }

  async mockSearchFileContent(userId, criteria) {
    const searchTerm = criteria.searchTerm.toLowerCase();
    const matches = [];

    // Simulate content matches
    const sampleContents = [
      "User authentication error occurred",
      "Database connection successful",
      "Payment processing completed",
      "High memory usage warning",
      "API request processed successfully",
      "Cache invalidation error",
    ];

    this.mockFiles.slice(0, 20).forEach((file, index) => {
      const content = sampleContents[index % sampleContents.length];
      if (content.toLowerCase().includes(searchTerm)) {
        matches.push({
          fileName: file.fileName,
          key: file.key,
          context: content,
          line: 1,
          service: file.service,
        });
      }
    });

    return {
      success: true,
      matches: matches.slice(0, criteria.limit || 10),
      totalMatches: matches.length,
      searchTerm: criteria.searchTerm,
    };
  }

  async mockGetFileDetails(userId, fileKey) {
    const file = this.mockFiles.find((f) => f.key === fileKey);

    if (!file) {
      return {
        success: false,
        error: "File not found",
      };
    }

    return {
      success: true,
      file: {
        ...file,
        contentType: "application/json",
        encoding: "gzip",
      },
      metadata: {
        downloadUrl: `https://mock-s3.amazonaws.com/${file.key}?expires=3600`,
        expiresIn: 3600,
        accessToken: "mock-access-token-123",
      },
    };
  }

  async mockGetFileStatistics(userId) {
    const stats = {
      totalFiles: this.mockFiles.length,
      totalSize: this.mockFiles.reduce((sum, file) => sum + file.size, 0),
      extensionCounts: {},
      serviceCounts: {},
      sizeDistribution: {},
    };

    stats.totalSizeFormatted = this.formatBytes(stats.totalSize);
    stats.averageFileSize = Math.floor(stats.totalSize / stats.totalFiles);

    // Calculate extension counts
    this.mockFiles.forEach((file) => {
      stats.extensionCounts[file.extension] =
        (stats.extensionCounts[file.extension] || 0) + 1;
      stats.serviceCounts[file.service] =
        (stats.serviceCounts[file.service] || 0) + 1;
    });

    // Find date range
    const dates = this.mockFiles.map((f) => new Date(f.lastModified));
    stats.dateRange = {
      earliest: new Date(Math.min(...dates)).toISOString(),
      latest: new Date(Math.max(...dates)).toISOString(),
    };

    // Find largest file
    const largest = this.mockFiles.reduce(
      (max, file) => (file.size > max.size ? file : max),
      this.mockFiles[0]
    );

    stats.largestFile = {
      fileName: largest.fileName,
      size: largest.size,
      sizeFormatted: this.formatBytes(largest.size),
    };

    return {
      success: true,
      statistics: stats,
    };
  }

  formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
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

  async demonstrateBasicSearch() {
    console.log("\n🔍 === BASIC SEARCH DEMO ===");

    // Basic search - get recent files
    console.log("1. Basic search (recent files):");
    const basicResult = await this.mockSearchFiles(this.userId, {
      limit: 5,
      sortBy: "lastModified",
      sortOrder: "desc",
    });
    this.printSearchResult(basicResult, "Basic Search");

    // Search with file extension filter
    console.log("\n2. Filter by file extension (JSON only):");
    const jsonResult = await this.mockSearchFiles(this.userId, {
      fileExtensions: ["json"],
      limit: 3,
      sortBy: "lastModified",
    });
    this.printSearchResult(jsonResult, "JSON Files Only");
  }

  async demonstrateDateFiltering() {
    console.log("\n📅 === DATE FILTERING DEMO ===");

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    // Today's files
    console.log("1. Today's files:");
    const todayResult = await this.mockSearchFiles(this.userId, {
      dateRange: { from: today, to: today },
      limit: 5,
    });
    this.printSearchResult(todayResult, "Today's Files");

    // Last 2 days
    console.log("\n2. Last 2 days:");
    const recentResult = await this.mockSearchFiles(this.userId, {
      dateRange: { from: yesterday, to: today },
      limit: 10,
      sortBy: "lastModified",
      sortOrder: "desc",
    });
    this.printSearchResult(recentResult, "Last 2 Days");
  }

  async demonstrateAdvancedFiltering() {
    console.log("\n⚡ === ADVANCED FILTERING DEMO ===");

    // Complex filter combination
    console.log("1. Advanced filter combination:");
    const advancedResult = await this.mockSearchFiles(this.userId, {
      fileNamePattern: "hour-.*",
      fileExtensions: ["json"],
      sizeRange: { min: 1024, max: 5242880 }, // 1KB to 5MB
      sortBy: "size",
      sortOrder: "desc",
      limit: 5,
    });
    this.printSearchResult(advancedResult, "Advanced Filters");

    // Service-specific search
    console.log("\n2. Service-specific search (API service):");
    const serviceResult = await this.mockSearchFiles(this.userId, {
      serviceFilter: "api",
      limit: 3,
    });
    this.printSearchResult(serviceResult, "API Service Files");
  }

  async demonstrateContentSearch() {
    console.log("\n📄 === CONTENT SEARCH DEMO ===");

    // Search for error content
    console.log('1. Search for "error" in content:');
    const errorResult = await this.mockSearchFileContent(this.userId, {
      searchTerm: "error",
      fileTypes: ["json", "log"],
      limit: 5,
    });

    if (errorResult.success && errorResult.matches.length > 0) {
      console.log(`✅ Found ${errorResult.totalMatches} content matches:`);
      errorResult.matches.slice(0, 3).forEach((match, index) => {
        console.log(`   ${index + 1}. ${match.fileName}`);
        console.log(`      Context: ${match.context}`);
      });
    } else {
      console.log('ℹ️  No content matches found for "error"');
    }

    // Search for success
    console.log('\n2. Search for "success" in content:');
    const successResult = await this.mockSearchFileContent(this.userId, {
      searchTerm: "success",
      fileTypes: ["json"],
      limit: 3,
    });

    if (successResult.success && successResult.matches.length > 0) {
      console.log(`✅ Found ${successResult.totalMatches} success matches:`);
      successResult.matches.forEach((match, index) => {
        console.log(`   ${index + 1}. ${match.fileName} - ${match.context}`);
      });
    } else {
      console.log('ℹ️  No content matches found for "success"');
    }
  }

  async demonstrateFileDetails() {
    console.log("\n📋 === FILE DETAILS DEMO ===");

    // Get a sample file
    const sampleFile = this.mockFiles[0];
    console.log(`1. Getting details for: ${sampleFile.fileName}`);

    const details = await this.mockGetFileDetails(this.userId, sampleFile.key);

    if (details.success) {
      console.log("✅ File details:");
      console.log(`   📁 Name: ${details.file.fileName}`);
      console.log(`   📏 Size: ${details.file.sizeFormatted}`);
      console.log(
        `   📅 Modified: ${new Date(
          details.file.lastModified
        ).toLocaleString()}`
      );
      console.log(`   🏷️  Service: ${details.file.service}`);
      console.log(`   📂 Folder: ${details.file.folder}`);
      console.log(
        `   🔗 Download URL: Available (expires in ${details.metadata.expiresIn} seconds)`
      );
    }
  }

  async demonstrateStatistics() {
    console.log("\n📊 === STATISTICS DEMO ===");

    console.log("1. Overall file statistics:");
    const stats = await this.mockGetFileStatistics(this.userId);

    if (stats.success) {
      const s = stats.statistics;
      console.log("✅ File Statistics:");
      console.log(`   📁 Total Files: ${s.totalFiles.toLocaleString()}`);
      console.log(`   💾 Total Size: ${s.totalSizeFormatted}`);
      console.log(`   📊 Average Size: ${this.formatBytes(s.averageFileSize)}`);
      console.log(
        `   📅 Date Range: ${new Date(
          s.dateRange.earliest
        ).toLocaleDateString()} - ${new Date(
          s.dateRange.latest
        ).toLocaleDateString()}`
      );

      console.log("   📄 File Types:");
      Object.entries(s.extensionCounts).forEach(([ext, count]) => {
        console.log(`      .${ext}: ${count} files`);
      });

      console.log("   🏷️  Services:");
      Object.entries(s.serviceCounts).forEach(([service, count]) => {
        console.log(`      ${service}: ${count} files`);
      });

      console.log(
        `   🎯 Largest File: ${s.largestFile.fileName} (${s.largestFile.sizeFormatted})`
      );
    }
  }

  async demonstratePagination() {
    console.log("\n📄 === PAGINATION DEMO ===");

    const limit = 3;

    // First page
    console.log("1. First page (0-2):");
    const page1 = await this.mockSearchFiles(this.userId, {
      limit: limit,
      offset: 0,
      sortBy: "lastModified",
      sortOrder: "desc",
    });
    this.printSearchResult(page1, "Page 1");

    // Second page
    console.log("\n2. Second page (3-5):");
    const page2 = await this.mockSearchFiles(this.userId, {
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

  async runCompleteDemo() {
    console.log("🎯 LogStack File Search & Filter Mock Demo\n");
    console.log("=".repeat(60));
    console.log(
      `📊 Generated ${this.mockFiles.length} mock files for demonstration`
    );

    try {
      await this.demonstrateBasicSearch();
      await this.demonstrateDateFiltering();
      await this.demonstrateAdvancedFiltering();
      await this.demonstrateContentSearch();
      await this.demonstrateFileDetails();
      await this.demonstrateStatistics();
      await this.demonstratePagination();

      console.log("\n✅ Complete mock demo finished successfully!");
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
      console.log("   1. Setup AWS credentials in .env file");
      console.log("   2. Run: node file-search-demo.js (for real AWS testing)");
      console.log("   3. Run: node file-search-test.js (for API testing)");
      console.log("   4. Use the search functions in your application");
    } catch (error) {
      console.error("❌ Demo failed:", error);
    }
  }
}

// Run demo if called directly
if (require.main === module) {
  const demo = new MockFileSearchDemo();
  demo.runCompleteDemo().catch(console.error);
}

module.exports = MockFileSearchDemo;
