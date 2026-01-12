#!/usr/bin/env node

import { createTheme } from '../src/theme/index.js';
import {
  basicColorsScenario,
  transformsScenario,
  modifiersScenario,
  backgroundsScenario,
} from './scenarios/index.js';

async function main(): Promise<void> {
  console.log('ChromaTerm Smoke Test');
  console.log('=====================\n');

  // Detect and display capabilities
  const theme = await createTheme();
  console.log('Terminal Capabilities:');
  console.log(`  Color Level: ${theme.capabilities.color}`);
  console.log(`  Theme Level: ${theme.capabilities.theme}`);
  console.log(`  TTY: ${String(theme.capabilities.isTTY)}`);
  console.log();

  // Run scenarios
  const scenarios = [
    basicColorsScenario,
    transformsScenario,
    modifiersScenario,
    backgroundsScenario,
  ];

  for (const scenario of scenarios) {
    const result = scenario(theme);
    console.log(`--- ${result.name} ---`);
    console.log(result.description);
    console.log();
    console.log(result.output);
    console.log();
  }

  // Instructions
  console.log('--- Instructions ---');
  console.log('1. Run this in different terminals to verify rendering across environments');
  console.log('2. Change your terminal theme (light/dark) and re-run to verify theme alignment');
  console.log('3. If colors look wrong, check theme.capabilities above for detection issues');
  console.log('4. All 16 base colors should be distinct and match your terminal theme');
  console.log(
    '5. Transforms should show visible changes from base colors (brighter, darker, etc.)'
  );
  console.log('6. Text modifiers should render correctly where supported');
  console.log();
}

main().catch((error: unknown) => {
  console.error('Error running smoke test:', error);
  process.exit(1);
});
