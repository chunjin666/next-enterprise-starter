import { toCamelCase } from '../src/infra/utils/case-converter.js'
import fs from 'fs'
import path from 'path'
import ts from 'typescript'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Checks if we're inside a Tables, Views, or Functions section of the Database type
 * @param {ts.Node} node - The current node being visited
 * @param {string[]} path - The path to the current node
 * @returns {boolean} - Whether the node should be transformed
 */
function shouldTransformProperties(node, path) {
  // Transform properties within Database.public.Tables.{tableName}.{Row|Insert|Update}
  // or Database.public.Views.{viewName}.{Row|Insert|Update}
  const isTableOrView = (path.includes('Tables') || path.includes('Views')) && 
         (path.includes('Row') || path.includes('Insert') || path.includes('Update'))

  // Transform properties within Database.public.Functions.{functionName}.{Args|Returns}
  const isFunction = path.includes('Functions') && 
         (path.includes('Args') || path.includes('Returns'))

  return isTableOrView || isFunction
}

/**
 * Checks if we're inside a Relationships array and should transform column names
 * @param {ts.Node} node - The current node being visited
 * @param {string[]} path - The path to the current node
 * @returns {boolean} - Whether the node should be transformed
 */
function shouldTransformRelationshipColumns(node, path) {
  // Transform column names within Relationships arrays
  return path.includes('Relationships') && 
         (path.includes('columns') || path.includes('referencedColumns'))
}

/**
 * Custom transformer that transforms properties in specific locations
 */
function createTransformer() {
  /**
   * Transforms property signatures in Tables/Views Row/Insert/Update
   * and string literals in Relationships columns/referencedColumns arrays
   * @param {ts.TransformationContext} context - The transformation context
   * @returns {(node: ts.Node) => ts.Node} - The transformer factory function
   */
  return context => {
    /**
     * Recursively visits each node in the AST, transforming property signatures
     * and string literals in Relationships arrays if they meet the criteria
     * @param {ts.Node} node - The current node being visited
     * @param {string[]} path - The path to the current node
     * @returns {ts.Node} - The transformed node
     */
    const visit = (node, path = []) => {
      // Transform property signatures in Tables/Views Row/Insert/Update
      if (ts.isPropertySignature(node) && ts.isIdentifier(node.name)) {
        if (shouldTransformProperties(node, path)) {
          const originalName = node.name.text
          const camelCaseName = toCamelCase(originalName)

          if (originalName !== camelCaseName) {
            return ts.factory.updatePropertySignature(
              node,
              node.modifiers,
              ts.factory.createIdentifier(camelCaseName),
              node.questionToken,
              node.type
            )
          }
        }
      }

      // Transform string literals in Relationships columns/referencedColumns arrays
      if (ts.isStringLiteral(node) && shouldTransformRelationshipColumns(node, path)) {
        const originalValue = node.text
        const camelCaseValue = toCamelCase(originalValue)
        
        if (originalValue !== camelCaseValue) {
          return ts.factory.createStringLiteral(camelCaseValue)
        }
      }

      // Add current node name to path for context
      let newPath = path
      if (ts.isPropertySignature(node) && ts.isIdentifier(node.name)) {
        newPath = [...path, node.name.text]
      } else if (ts.isIdentifier(node)) {
        newPath = [...path, node.text]
      }

      return ts.visitEachChild(node, child => visit(child, newPath), context)
    }

    return node => ts.visitNode(node, visit)
  }
}

function main() {
  let sourceCode = ''

  // Check if there's data from stdin (pipe)
  if (!process.stdin.isTTY) {
    // Read from stdin when piped
    process.stdin.setEncoding('utf8')
    sourceCode = ''

    process.stdin.on('data', (chunk) => {
      sourceCode += chunk
    })

    process.stdin.on('end', () => {
      processSourceCode(sourceCode)
    })
  } else {
    // Fallback to reading file if no pipe input
    const inputPath = path.resolve(__dirname, '../lib/types/database.source.ts')
    sourceCode = fs.readFileSync(inputPath, 'utf8')
    processSourceCode(sourceCode)
  }
}

/**
 * Transforms TypeScript source code by camelizing property signatures
 * and string literals in Relationships arrays
 * @param {string} sourceCode - The TypeScript source code to transform
 */
function processSourceCode(sourceCode) {
  // Parse the TypeScript source file
  const sourceFile = ts.createSourceFile('database.source.ts', sourceCode, ts.ScriptTarget.Latest, true)

  // Check if parsing was successful
  if (!sourceFile) {
    console.error('❌ Failed to parse TypeScript source code')
    process.exit(1)
  }

  // Transform the AST
  const result = ts.transform(sourceFile, [createTransformer()])
  const transformedSourceFile = /** @type {ts.SourceFile} */(result.transformed[0])

  // Generate the new TypeScript code
  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
  })

  const transformedCode = printer.printFile(transformedSourceFile)

  // Clean up
  result.dispose()

  // Check if we should output to file or stdout
  if (process.stdin.isTTY) {
    // When not piped, write to file
    const outputPath = path.resolve(__dirname, '../lib/types/database.ts')
    fs.writeFileSync(outputPath, transformedCode)
    console.log('✅ Type transformation complete. Output file 📎: types/database.ts')
  } else {
    // When piped, output only the transformed code to stdout (no extra logging)
    process.stdout.write(transformedCode)
  }
}

main()
