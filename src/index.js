#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { basename, join } from 'node:path';

import * as espree from 'espree';

import { getFilePathFromCLI } from './funcs/get-file-path.js';
import { Reporter } from './reporter.js';
import { SyntaxTreeProcessor } from './syntax-tree-processor.js';

const filePath = getFilePathFromCLI();
const outputFilePath = join(
  process.cwd(), `${basename(filePath, '.js')}.linted.js`,
);

const code = readFileSync(filePath, 'utf-8');

const ast = espree.parse(code, {
  ecmaVersion: 2020,
  loc: true,
  sourceType: 'module',
});

const syntaxTreeProcessor = new SyntaxTreeProcessor({ filePath });
const errors = syntaxTreeProcessor.process({ ast })

Reporter.report({
  errors,
  ast,
  outputFilePath,
});