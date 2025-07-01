// @ts-nocheck - TypeScript transformer uses internal APIs with complex types
import * as ts from 'typescript';
import type { SlugStorePluginConfig } from './types.js';

/**
 * TypeScript transformer for slug-store compile-time optimizations
 * Transforms code during compilation to optimize bundle size and performance
 */
export function createSlugStoreTransformer(
  program: ts.Program,
  config: SlugStorePluginConfig = {}
): ts.TransformerFactory<ts.SourceFile> {
  
  return (context: ts.TransformationContext) => {
    const typeChecker = program.getTypeChecker();

    return (sourceFile: ts.SourceFile): ts.SourceFile => {
      if (sourceFile.isDeclarationFile) {
        return sourceFile;
      }

      const visitor = (node: ts.Node): ts.Node => {
        // Transform slug-store imports for tree-shaking
        if (ts.isImportDeclaration(node)) {
          const transformed = transformImport(node, config);
          if (transformed !== node) {
            return transformed;
          }
        }

        // Transform useSlugStore calls for auto-config
        if (ts.isCallExpression(node)) {
          const transformed = transformCallExpression(node, typeChecker, config);
          if (transformed !== node) {
            return transformed;
          }
        }

        // Transform object literals for optimization
        if (ts.isObjectLiteralExpression(node)) {
          const transformed = transformObjectLiteral(node, config);
          if (transformed !== node) {
            return transformed;
          }
        }

        return ts.visitEachChild(node, visitor, context);
      };

      return ts.visitNode(sourceFile, visitor) as ts.SourceFile;
    };
  };
}

/**
 * Transform imports for better tree-shaking
 */
function transformImport(
  node: ts.ImportDeclaration,
  config: SlugStorePluginConfig
): ts.ImportDeclaration {
  
  if (!node.moduleSpecifier || !ts.isStringLiteral(node.moduleSpecifier)) {
    return node;
  }

  const moduleSpecifier = node.moduleSpecifier.text;
  
  // Transform generic slug-store imports to specific client/server imports
  if (moduleSpecifier === 'slug-store' || moduleSpecifier === '@farajabien/slug-store') {
    return transformGenericImport(node, config);
  }

  return node;
}

/**
 * Transform generic slug-store imports to specific imports
 */
function transformGenericImport(
  node: ts.ImportDeclaration,
  config: SlugStorePluginConfig
): ts.ImportDeclaration {
  
  if (!node.importClause?.namedBindings || !ts.isNamedImports(node.importClause.namedBindings)) {
    return node;
  }

  const namedImports = node.importClause.namedBindings;
  const clientImports: string[] = [];
  const serverImports: string[] = [];

  // Categorize imports
  for (const importSpecifier of namedImports.elements) {
    const importName = importSpecifier.name.text;
    
    if (isClientSideImport(importName)) {
      clientImports.push(importName);
    } else if (isServerSideImport(importName)) {
      serverImports.push(importName);
    }
  }

  // If we have mixed imports, we need to split them
  if (clientImports.length > 0 && serverImports.length > 0) {
    // This is complex to handle in a transformer, so we'll emit a warning
    // In a real implementation, you might want to create multiple import statements
    console.warn('Mixed client/server imports detected. Consider splitting imports for better tree-shaking.');
    return node;
  }

  // Transform to specific import
  if (clientImports.length > 0) {
    return ts.factory.updateImportDeclaration(
      node,
      node.modifiers,
      node.importClause,
      ts.factory.createStringLiteral('slug-store/client'),
      node.assertClause
    );
  }

  if (serverImports.length > 0) {
    return ts.factory.updateImportDeclaration(
      node,
      node.modifiers,
      node.importClause,
      ts.factory.createStringLiteral('slug-store/server'),
      node.assertClause
    );
  }

  return node;
}

/**
 * Transform call expressions for optimization
 */
function transformCallExpression(
  node: ts.CallExpression,
  typeChecker: ts.TypeChecker,
  config: SlugStorePluginConfig
): ts.CallExpression {
  
  if (!ts.isIdentifier(node.expression)) {
    return node;
  }

  const functionName = node.expression.text;

  // Transform useSlugStore calls
  if (functionName === 'useSlugStore') {
    return transformUseSlugStoreCall(node, typeChecker, config);
  }

  // Transform createNextState calls
  if (functionName === 'createNextState') {
    return transformCreateNextStateCall(node, typeChecker, config);
  }

  return node;
}

/**
 * Transform useSlugStore calls to add auto-config
 */
function transformUseSlugStoreCall(
  node: ts.CallExpression,
  typeChecker: ts.TypeChecker,
  config: SlugStorePluginConfig
): ts.CallExpression {
  
  if (!config.autoConfig || !node.expression) {
    return node;
  }

  // If no options object is provided, add one with autoConfig
  if (node.arguments.length === 1) {
    const autoConfigOption = ts.factory.createObjectLiteralExpression([
      ts.factory.createPropertyAssignment(
        'autoConfig',
        ts.factory.createTrue()
      )
    ]);

    return ts.factory.updateCallExpression(
      node,
      node.expression,
      node.typeArguments,
      [...node.arguments, autoConfigOption]
    );
  }

  // If options object exists, ensure autoConfig is set
  if (node.arguments.length >= 2 && ts.isObjectLiteralExpression(node.arguments[1])) {
    const optionsObject = node.arguments[1];
    const hasAutoConfig = optionsObject.properties.some(prop =>
      ts.isPropertyAssignment(prop) &&
      ts.isIdentifier(prop.name) &&
      prop.name.text === 'autoConfig'
    );

    if (!hasAutoConfig) {
      const newProperties = [
        ...optionsObject.properties,
        ts.factory.createPropertyAssignment(
          'autoConfig',
          ts.factory.createTrue()
        )
      ];

      const newOptionsObject = ts.factory.updateObjectLiteralExpression(
        optionsObject,
        newProperties
      );

      const newArguments = [...node.arguments];
      newArguments[1] = newOptionsObject;

      return ts.factory.updateCallExpression(
        node,
        node.expression,
        node.typeArguments,
        newArguments
      );
    }
  }

  return node;
}

/**
 * Transform createNextState calls
 */
function transformCreateNextStateCall(
  node: ts.CallExpression,
  typeChecker: ts.TypeChecker,
  config: SlugStorePluginConfig
): ts.CallExpression {
  
  if (!config.autoConfig || !node.expression) {
    return node;
  }

  // Similar to useSlugStore, but for server-side calls
  if (node.arguments.length === 1 && ts.isObjectLiteralExpression(node.arguments[0])) {
    const optionsObject = node.arguments[0];
    const hasAutoConfig = optionsObject.properties.some(prop =>
      ts.isPropertyAssignment(prop) &&
      ts.isIdentifier(prop.name) &&
      prop.name.text === 'autoConfig'
    );

    if (!hasAutoConfig) {
      const newProperties = [
        ...optionsObject.properties,
        ts.factory.createPropertyAssignment(
          'autoConfig',
          ts.factory.createTrue()
        )
      ];

      const newOptionsObject = ts.factory.updateObjectLiteralExpression(
        optionsObject,
        newProperties
      );

      return ts.factory.updateCallExpression(
        node,
        node.expression,
        node.typeArguments,
        [newOptionsObject]
      );
    }
  }

  return node;
}

/**
 * Transform object literals for compile-time optimization
 */
function transformObjectLiteral(
  node: ts.ObjectLiteralExpression,
  config: SlugStorePluginConfig
): ts.ObjectLiteralExpression {
  
  if (!config.bundleOptimization) {
    return node;
  }

  // Remove undefined properties at compile time
  const optimizedProperties = node.properties.filter(prop => {
    if (ts.isPropertyAssignment(prop) && 
        ts.isIdentifier(prop.initializer) &&
        prop.initializer.text === 'undefined') {
      return false; // Remove undefined properties
    }
    return true;
  });

  if (optimizedProperties.length !== node.properties.length) {
    return ts.factory.updateObjectLiteralExpression(node, optimizedProperties);
  }

  return node;
}

/**
 * Check if an import name is client-side
 */
function isClientSideImport(importName: string): boolean {
  const clientImports = ['useSlugStore', 'use'];
  return clientImports.includes(importName);
}

/**
 * Check if an import name is server-side
 */
function isServerSideImport(importName: string): boolean {
  const serverImports = ['createNextState', 'Provider'];
  return serverImports.includes(importName);
}

/**
 * Webpack plugin integration for the transformer
 */
export class SlugStoreWebpackPlugin {
  private config: SlugStorePluginConfig;

  constructor(config: SlugStorePluginConfig = {}) {
    this.config = config;
  }

  apply(compiler: any): void {
    compiler.hooks.compilation.tap('SlugStoreWebpackPlugin', (compilation: any) => {
      compilation.hooks.buildModule.tap('SlugStoreWebpackPlugin', (module: any) => {
        if (module.resource && (module.resource.endsWith('.ts') || module.resource?.endsWith('.tsx'))) {
          // Apply transformer during webpack build
          this.applyTransformer(module);
        }
      });
    });
  }

  private applyTransformer(module: any): void {
    // Implementation would depend on webpack integration
    // This is a placeholder for webpack-specific transformer application
    if (this.config.debug) {
      console.log(`Applying slug-store transformer to ${module.resource}`);
    }
  }
}

/**
 * Rollup plugin integration for the transformer
 */
export function slugStoreRollupPlugin(config: SlugStorePluginConfig = {}): any {
  return {
    name: 'slug-store-transformer',
    transform(code: string, id: string) {
      if (id.endsWith('.ts') || id.endsWith('.tsx')) {
        try {
          // Apply TypeScript transformer
          const sourceFile = ts.createSourceFile(
            id,
            code,
            ts.ScriptTarget.Latest,
            true
          );

          const compilerHost: ts.CompilerHost = {
            getSourceFile: (fileName: string) => fileName === id ? sourceFile : undefined,
            writeFile: () => {},
            getCurrentDirectory: () => '',
            getDirectories: () => [],
            fileExists: () => true,
            readFile: () => '',
            getCanonicalFileName: (fileName: string) => fileName,
            useCaseSensitiveFileNames: () => true,
            getNewLine: () => '\n',
            getDefaultLibFileName: () => 'lib.d.ts',
          };

          const program = ts.createProgram([id], {}, compilerHost);
          const transformer = createSlugStoreTransformer(program, config);
          const result = ts.transform(sourceFile, [transformer]);
          
          if (result.transformed.length > 0) {
            const transformedFile = result.transformed[0];
            if (transformedFile) {
              const printer = ts.createPrinter();
              const transformedCode = printer.printFile(transformedFile);
              result.dispose();
              
              return {
                code: transformedCode,
                map: null, // Would need source map generation in production
              };
            }
          }

          result.dispose();
        } catch (error) {
          if (config.debug) {
            console.error(`Error transforming ${id}:`, error);
          }
        }
      }
      
      return null;
    },
  };
} 