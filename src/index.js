#!/usr/bin/env node

import { readFileSync } from 'node:fs';

import * as espree from 'espree';

import { getFilePathFromCLI } from './funcs/get-file-path.js';

const filePath = getFilePathFromCLI();
const code = readFileSync(filePath, 'utf-8');

const ast = espree.parse(code, {
  ecmaVersion: 2020,
  loc: true,
  sourceType: 'module',
});

console.log(ast);