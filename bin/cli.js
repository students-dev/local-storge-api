#!/usr/bin/env node

/**
 * Local Storage API CLI Tool
 * Created by Ramkrishna Bhatt V, Milagres PU College, Kallianpur, Udupi
 * License: MIT
 */

const { LocalStorageAPI } = require('../dist/index.cjs');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  const storage = new LocalStorageAPI();

  switch (command) {
    case 'inspect':
      await inspect(storage);
      break;
    case 'export':
      await exportData(storage);
      break;
    case 'import':
      await importData(storage);
      break;
    case 'visualize':
      await visualize(storage);
      break;
    case 'benchmark':
      await benchmark(storage);
      break;
    default:
      showHelp();
      break;
  }
}

async function inspect(storage) {
  console.log('🔍 Local Storage API Inspector');
  console.log('================================');

  const keys = await storage.keys();
  const size = await storage.size();
  const supports = storage.supports();
  const metrics = storage.getMetrics();

  console.log(`Total keys: ${size}`);
  console.log(`Storage layer: ${supports.current}`);
  console.log(`Read operations: ${metrics.reads}`);
  console.log(`Write operations: ${metrics.writes}`);
  console.log(`Average read latency: ${metrics.avgReadLatency.toFixed(2)}ms`);
  console.log(`Average write latency: ${metrics.avgWriteLatency.toFixed(2)}ms`);

  if (keys.length > 0) {
    console.log('\n📋 Keys:');
    keys.slice(0, 10).forEach(key => console.log(`  - ${key}`));
    if (keys.length > 10) console.log(`  ... and ${keys.length - 10} more`);
  }
}

async function exportData(storage) {
  const output = args[1] || 'storage-export.json';
  const data = await storage.exportJSON();
  fs.writeFileSync(output, data);
  console.log(`✅ Exported ${Object.keys(JSON.parse(data)).length} items to ${output}`);
}

async function importData(storage) {
  const input = args[1];
  if (!input || !fs.existsSync(input)) {
    console.error('❌ Please provide a valid input file');
    process.exit(1);
  }

  const data = fs.readFileSync(input, 'utf8');
  await storage.importJSON(data);
  console.log(`✅ Imported data from ${input}`);
}

async function visualize(storage) {
  const data = await storage.all();
  const keys = Object.keys(data);

  console.log('📊 Storage Visualization');
  console.log('========================');

  const types = {};
  keys.forEach(key => {
    const value = data[key];
    const type = Array.isArray(value) ? 'array' :
                 value instanceof Date ? 'date' :
                 typeof value;
    types[type] = (types[type] || 0) + 1;
  });

  console.log('Data types:');
  Object.entries(types).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });

  // Simple ASCII chart
  const chartWidth = 40;
  const maxCount = Math.max(...Object.values(types));
  Object.entries(types).forEach(([type, count]) => {
    const barLength = Math.round((count / maxCount) * chartWidth);
    const bar = '█'.repeat(barLength);
    console.log(`  ${type.padEnd(10)} ${bar} ${count}`);
  });
}

async function benchmark(storage) {
  console.log('🏃 Running benchmark...');
  const results = await storage.benchmark(1000);

  console.log('📈 Benchmark Results');
  console.log('====================');
  console.log(`Write: ${results.write.total}ms total, ${results.write.avg.toFixed(2)}ms avg`);
  console.log(`Read: ${results.read.total}ms total, ${results.read.avg.toFixed(2)}ms avg`);
}

function showHelp() {
  console.log(`
🗄️  Local Storage API CLI Tool v1.0.0
=====================================

Usage: npx local-storage-api <command> [options]

Commands:
  inspect          Show storage statistics and keys
  export [file]    Export all data to JSON file (default: storage-export.json)
  import <file>    Import data from JSON file
  visualize        Show data type distribution and charts
  benchmark        Run performance benchmark
  help             Show this help message

Examples:
  npx local-storage-api inspect
  npx local-storage-api export my-data.json
  npx local-storage-api import backup.json
  npx local-storage-api visualize
  npx local-storage-api benchmark

Created by Ramkrishna Bhatt V, Milagres PU College, Kallianpur, Udupi
  `);
}

main().catch(console.error);