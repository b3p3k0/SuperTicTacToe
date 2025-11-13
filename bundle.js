const fs = require('fs');
const path = require('path');

// Order matters for dependencies - these must be loaded in the right sequence
const bundleOrder = [
  'dist/core/types.js',
  'dist/core/constants.js',
  'dist/core/engine.js',
  'dist/ai/utils.js',
  'dist/ai/evaluator.js',
  'dist/ai/rule-heuristics.js',
  'dist/ai/diagnostics.js',
  'dist/ai/simulator.js',
  'dist/ai/strategies/easy.js',
  'dist/ai/strategies/normal.js',
  'dist/ai/strategies/hard.js',
  'dist/ai/controller.js',
  'dist/analytics/solo-tracker.js',
  'dist/ui/theme-manager.js',
  'dist/ui/components/panels.js',
  'dist/ui/components/board.js',
  'dist/ui/components/overlays.js',
  'dist/ui/game-ui.js',
  'dist/main.js'
];

let bundledCode = `"use strict";\n\n`;

// Read each file and strip imports/exports to create a single concatenated file
for (const filePath of bundleOrder) {
  if (fs.existsSync(filePath)) {
    console.log(`Processing ${filePath}`);
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove import statements
    content = content.replace(/^import\s+.*?from\s+.*?;?\s*$/gm, '');

    // Remove export statements but keep the declarations
    content = content.replace(/^export\s+/gm, '');

    // Remove standalone object literals that are bundling artifacts
    content = content.replace(/^{};?\s*$/gm, '');

    // Skip files that only contain whitespace or are effectively empty
    const cleanedContent = content.trim();
    if (cleanedContent === '' || cleanedContent === '{}') {
      console.log(`Skipping empty file: ${filePath}`);
      continue;
    }

    // Add the processed content to the bundle
    bundledCode += `// === ${filePath} ===\n`;
    bundledCode += content + '\n\n';
  } else {
    console.warn(`File not found: ${filePath}`);
  }
}

// Write the bundled file
fs.writeFileSync('game.js', bundledCode);
console.log('Bundle created: game.js');
