#!/usr/bin/env node

const { componentGenerator } = require('../src/lib/component-generator');
const path = require('path');
const fs = require('fs');

// CLI colors for better output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

// Available component types
const COMPONENT_TYPES = {
  userDashboard: 'User Dashboard - A complete user management dashboard',
  recordingInterface: 'Recording Interface - Audio/video recording component',
  dataTable: 'Data Table - Sortable and filterable table component',
  formBuilder: 'Form Builder - Dynamic form generation component',
  chartWidget: 'Chart Widget - Data visualization component',
  modal: 'Modal Dialog - Reusable modal component',
  sidebar: 'Sidebar Navigation - Collapsible sidebar component',
  cardLayout: 'Card Layout - Flexible card-based layout'
};

function showHelp() {
  console.log(`${colors.cyan}v0 Component Generator${colors.reset}

Usage: node scripts/generate-component.js <componentType> [options]

Available Component Types:
${Object.entries(COMPONENT_TYPES).map(([key, desc]) =>
  `  ${colors.yellow}${key.padEnd(18)}${colors.reset} - ${desc}`
).join('\n')}

Options:
  --output, -o <path>     Output directory (default: ./generated-components)
  --style <theme>         Style theme (default, modern, minimal)
  --typescript, -ts       Generate TypeScript components
  --help, -h             Show this help message

Examples:
  node scripts/generate-component.js userDashboard
  node scripts/generate-component.js recordingInterface --typescript
  node scripts/generate-component.js dataTable --output ./src/components --style modern
`);
}

function parseArguments() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  const componentType = args[0];

  if (!COMPONENT_TYPES[componentType]) {
    console.error(`${colors.red}Error: Unknown component type "${componentType}"${colors.reset}`);
    console.log(`\nRun with --help to see available component types.`);
    process.exit(1);
  }

  const options = {
    componentType,
    output: './generated-components',
    style: 'default',
    typescript: false
  };

  for (let i = 1; i < args.length; i++) {
    switch (args[i]) {
      case '--output':
      case '-o':
        options.output = args[++i];
        break;
      case '--style':
        options.style = args[++i];
        break;
      case '--typescript':
      case '-ts':
        options.typescript = true;
        break;
    }
  }

  return options;
}

function showProgress(message) {
  process.stdout.write(`${colors.blue}▶${colors.reset} ${message}...`);
}

function showSuccess(message) {
  console.log(`\r${colors.green}✓${colors.reset} ${message}`);
}

function showError(message) {
  console.log(`\r${colors.red}✗${colors.reset} ${message}`);
}

async function generateComponent(options) {
  try {
    showProgress('Initializing component generator');

    // Ensure output directory exists
    if (!fs.existsSync(options.output)) {
      fs.mkdirSync(options.output, { recursive: true });
    }
    showSuccess('Output directory ready');

    showProgress('Generating component files');

    const result = await componentGenerator({
      type: options.componentType,
      outputPath: options.output,
      style: options.style,
      typescript: options.typescript,
      customizations: {
        // Add any additional customizations based on CLI args
      }
    });

    showSuccess('Component files generated');

    // Show generated files
    console.log(`\n${colors.cyan}Generated Files:${colors.reset}`);
    if (result.files && result.files.length > 0) {
      result.files.forEach(file => {
        const relativePath = path.relative(process.cwd(), file);
        console.log(`  ${colors.green}+${colors.reset} ${relativePath}`);
      });
    } else {
      // Fallback if files array not provided
      const componentDir = path.join(options.output, options.componentType);
      console.log(`  ${colors.green}+${colors.reset} ${path.relative(process.cwd(), componentDir)}/`);
    }

    console.log(`\n${colors.green}✨ Component "${options.componentType}" generated successfully!${colors.reset}`);

    if (result.instructions) {
      console.log(`\n${colors.yellow}Next Steps:${colors.reset}`);
      console.log(result.instructions);
    }

  } catch (error) {
    showError('Failed to generate component');
    console.error(`\n${colors.red}Error Details:${colors.reset}`);
    console.error(error.message);

    if (error.stack && process.env.DEBUG) {
      console.error(`\n${colors.yellow}Stack Trace:${colors.reset}`);
      console.error(error.stack);
    }

    console.log(`\n${colors.yellow}Troubleshooting:${colors.reset}`);
    console.log('- Ensure the component generator is properly configured');
    console.log('- Check that you have write permissions to the output directory');
    console.log('- Try running with DEBUG=1 for more detailed error information');

    process.exit(1);
  }
}

async function main() {
  console.log(`${colors.cyan}🚀 v0 Component Generator${colors.reset}\n`);

  try {
    const options = parseArguments();

    console.log(`${colors.blue}Configuration:${colors.reset}`);
    console.log(`  Component Type: ${colors.yellow}${options.componentType}${colors.reset}`);
    console.log(`  Output Path: ${colors.yellow}${options.output}${colors.reset}`);
    console.log(`  Style Theme: ${colors.yellow}${options.style}${colors.reset}`);
    console.log(`  TypeScript: ${colors.yellow}${options.typescript ? 'Yes' : 'No'}${colors.reset}\n`);

    await generateComponent(options);

  } catch (error) {
    showError('Unexpected error occurred');
    console.error(error.message);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error(`${colors.red}Uncaught Exception:${colors.reset}`, error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error(`${colors.red}Unhandled Rejection:${colors.reset}`, reason);
  process.exit(1);
});

// Run the CLI
main();