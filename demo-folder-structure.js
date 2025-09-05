/**
 * Simple Folder Structure Demo
 * Run with: node demo-folder-structure.js
 */

const {
  generateFolderPath,
  generateCloudPath,
  createFolderStructureConfig,
  getFolderStructureExamples,
} = require("./dist/lib/folderStructure");

function demoFolderStructures() {
  console.log("📁 Folder Structure Configuration Demo\n");
  console.log("═".repeat(60));

  const mockDate = "2024-01-15";
  const mockHourRange = "14-15";
  const mockStatus = "success";
  const mockFileName = "api-logs.json";

  // Demo 1: Simple daily structure
  console.log("\n🎯 DEMO 1: Simple Daily Structure");
  console.log("─".repeat(40));
  const dailyConfig = {
    folderStructure: {
      type: "daily",
    },
  };

  const dailyPath = generateFolderPath(mockDate, dailyConfig);
  const dailyCloud = generateCloudPath(mockDate, mockFileName, dailyConfig);
  console.log(`Local Path:  ${dailyPath.split("\\").slice(-2).join("/")}`);
  console.log(`Cloud Path:  ${dailyCloud}`);

  // Demo 2: Monthly with sub-folders
  console.log("\n🎯 DEMO 2: Monthly with Sub-folders");
  console.log("─".repeat(40));
  const monthlyConfig = {
    folderStructure: {
      type: "monthly",
      subFolders: {
        enabled: true,
        byHour: true,
        byStatus: true,
      },
      naming: {
        prefix: "logs",
      },
    },
  };

  const monthlyPath = generateFolderPath(
    mockDate,
    monthlyConfig,
    mockHourRange,
    mockStatus
  );
  const monthlyCloud = generateCloudPath(
    mockDate,
    mockFileName,
    monthlyConfig,
    mockHourRange,
    mockStatus
  );
  console.log(`Local Path:  ${monthlyPath.split("\\").slice(-4).join("/")}`);
  console.log(`Cloud Path:  ${monthlyCloud}`);

  // Demo 3: Custom pattern
  console.log("\n🎯 DEMO 3: Custom Pattern");
  console.log("─".repeat(40));
  const customConfig = {
    folderStructure: {
      pattern: "YYYY/MM/DD",
      subFolders: {
        enabled: true,
        custom: ["processed", "validated"],
      },
    },
  };

  const customPath = generateFolderPath(mockDate, customConfig);
  const customCloud = generateCloudPath(mockDate, mockFileName, customConfig);
  console.log(`Local Path:  ${customPath.split("\\").slice(-5).join("/")}`);
  console.log(`Cloud Path:  ${customCloud}`);

  // Demo 4: Available templates
  console.log("\n🎯 DEMO 4: Configuration Templates");
  console.log("─".repeat(40));
  const templates = ["simple", "organized", "detailed"];
  templates.forEach((template) => {
    const config = createFolderStructureConfig(template);
    console.log(`\n📋 ${template.toUpperCase()} Template:`);
    console.log(`   Type: ${config.type}`);
    console.log(
      `   Sub-folders: ${config.subFolders?.enabled ? "Enabled" : "Disabled"}`
    );
    if (config.naming?.prefix)
      console.log(`   Prefix: ${config.naming.prefix}`);
  });

  // Demo 5: All examples
  console.log("\n🎯 DEMO 5: Available Examples");
  console.log("─".repeat(40));
  const examples = getFolderStructureExamples();
  Object.entries(examples).forEach(([name, { example }]) => {
    console.log(`\n📁 ${name}:`);
    console.log(`   ${example}`);
  });

  console.log("\n═".repeat(60));
  console.log("✅ Folder Structure Demo Complete");
  console.log("\n📝 Key Benefits:");
  console.log("• Flexible organization: daily/monthly/yearly");
  console.log("• Sub-folder support: hour, status, custom");
  console.log("• Custom naming: prefixes and suffixes");
  console.log("• Cloud storage compatible");
  console.log("• Production-ready templates");
}

// Run the demo
demoFolderStructures();
