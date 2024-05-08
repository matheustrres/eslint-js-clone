#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

import chalk from 'chalk';
import * as espree from 'espree';

function getFilePathFromCLI() {
  try {
    const { values: { file } } = parseArgs({
      options: {
        file: {
          type: 'string',
          alias: 'f',
        },
      },
    });

    if (!file) {
      throw new Error('Flag --file requires a file path to be specified.');
    }

    return file;
  } catch (error) {
    console.error(chalk.red('Error: Please provide a valid file path as an argument using -f or --file'));
    process.exit(1);
  }
}

const filePath = getFilePathFromCLI();
const code = readFileSync(filePath, 'utf-8');

const ast = espree.parse(code, {
  ecmaVersion: 2020,
  loc: true,
  sourceType: 'module',
});

console.log(ast);