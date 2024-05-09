export class SyntaxTreeProcessor {
  #filePath;

  #errors = new Map();
  #variables = new Map();

  #messages = {
    singleQuote: () => 'use single quotes instead of double quotes',
    useConst: (variableKind) => `use "const" instead of ${variableKind}`,
    useLet: (variableKind) => `use "let" instead of ${variableKind}`,
  }

  #stages = {
    declaration: 'declaration',
    expressionDeclaration: 'expressionDeclaration',
  }

  #variableKinds = {
    const: 'const',
    let: 'let',
    var: 'var',
  }

  static #validate(filePath) {
    if (!filePath || typeof filePath !== 'string') {
      throw new TypeError('Argument {filePath} is required and must be a string.')
    }
  }

  constructor({ filePath }) {
    SyntaxTreeProcessor.#validate(filePath);

    this.#filePath = filePath;
  }

  #storeError(message, { line, column }) {
    const errorLocation = `${this.#filePath}:${line}:${column + 1}`;

    this.#errors.set(errorLocation, { message, errorLocation });
  }

  #handleLiteral(nodeDeclaration) {
    if (!(nodeDeclaration.raw && typeof nodeDeclaration.value === 'string')) return;

    if (!nodeDeclaration.raw.includes(`"`)) return;

    nodeDeclaration.raw = nodeDeclaration.raw.replace(/"/g, "'");

    const { line, column } = nodeDeclaration.loc.start;

    this.#storeError(this.#messages.singleQuote(), { line, column });
  }

  #handleVariableDeclaration(nodeDeclaration) {
    const originalKind = nodeDeclaration.kind;

    for (const declaration of nodeDeclaration.declarations) {
      this.#variables.set(declaration.id.name, {
        originalKind,
        stage: this.#stages.declaration,
        nodeDeclaration,
      });
    }
  }

  #handleExpressionStatement(nodeDeclaration) {
    const { expression } = nodeDeclaration;

    if (!expression.left) return;

    const varName = (expression.left.object || expression.left).name;

    if (!this.#variables.has(varName)) return;
    
    const variable = this.#variables.get(varName)
    const { nodeDeclaration: varNodeDeclaration, originalKind, stage } = variable

    // Means changing an object property from a variable
    if (
      expression.left.type === 'MemberExpression' &&
      stage === this.#stages.declaration
    ) {
      if (originalKind === this.#variableKinds.const) return;

      this.#storeError(
        this.#messages.useConst(originalKind),
        varNodeDeclaration.loc.start,
      );

      varNodeDeclaration.kind = this.#variableKinds.const;

      this.#variables.set(varName, {
        ...variable,
        stage: this.#stages.expressionDeclaration,
        nodeDeclaration: varNodeDeclaration,
      });

      return;
    }

    // Means keeping the variable as it is
    if ([varNodeDeclaration.kind, originalKind].includes(this.#variableKinds.let)) {
      this.#variables.set(varName, {
        ...variable,
        stage: this.#stages.expressionDeclaration,
        nodeDeclaration: varNodeDeclaration,
      });

      return;
    }
  }

  #traverse(nodeDeclaration) {
    let hooks = {
      Literal: (node) => this.#handleLiteral(node),
      VariableDeclaration: (node) => this.#handleVariableDeclaration(node),
      ExpressionStatement: (node) => this.#handleExpressionStatement(node),
    }

    hooks[nodeDeclaration?.type]?.(nodeDeclaration)

    for (let key in nodeDeclaration) {
      if (typeof nodeDeclaration[key] !== 'object') continue;

      this.#traverse(nodeDeclaration[key]);
    }
  }

  process({ ast }) {
    this.#traverse(ast);

    return [...this.#errors.values()];
  }
}