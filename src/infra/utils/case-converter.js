// ! 请勿将此文件改为 TypeScript，因为 #/scripts/db-type-transform.js 仍在使用此文件

export function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase())
}

export function toSnakeCase(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

export function toPascalCase(str) {
  return str.charAt(0).toUpperCase() + toCamelCase(str).slice(1)
}
