import fs from "fs"
import { parse } from "csv-parse/sync"

const productosInput = "productos.csv"
const ventasInput = "ventas_articulos_curado.csv"
const ajustesInput = "ajustes_catalogo.csv"
const outputFile = "productos_final.csv"
const excludedCategories = new Set([
  "TINTAS",
  "VARIOS PRODUCTOS",
])

type CsvRecord = Record<string, string>

function readCsv(path: string) {
  if (!fs.existsSync(path)) {
    return [] as CsvRecord[]
  }

  const content = fs.readFileSync(path, "utf8")

  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    delimiter: ";",
    bom: true,
  }) as CsvRecord[]
}

function csvEscape(value: unknown) {
  const text = String(value ?? "")

  if (text.includes(";") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`
  }

  return text
}

function toNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value?.trim())

  if (!Number.isFinite(parsed)) {
    return fallback
  }

  return parsed
}

function normalizeVisible(value: string | undefined, fallback = "1") {
  const normalized = value?.trim()

  if (normalized === "0") {
    return "0"
  }

  if (normalized === "1") {
    return "1"
  }

  return fallback
}

function toCsv(rows: Record<string, unknown>[]) {
  const headers = [
    "code",
    "name",
    "category",
    "stock_quantity",
    "simple_description",
    "display_order",
    "visible",
  ]

  return [
    headers.join(";"),
    ...rows.map((row) =>
      headers.map((header) => csvEscape(row[header])).join(";")
    ),
  ].join("\n")
}

const productos = readCsv(productosInput)
const ventas = readCsv(ventasInput)
const ajustes = readCsv(ajustesInput)

const ventasByCode = new Map<string, CsvRecord>()
const ajustesByCode = new Map<string, CsvRecord>()

for (const venta of ventas) {
  const code = venta.code?.trim()

  if (code) {
    ventasByCode.set(code, venta)
  }
}

for (const ajuste of ajustes) {
  const code = ajuste.code?.trim()

  if (code) {
    ajustesByCode.set(code, ajuste)
  }
}

const manuales: Record<string, unknown>[] = []
const automaticos: Record<string, unknown>[] = []

for (const producto of productos) {
  const code = producto.code?.trim()
  const name = producto.name?.trim()
  const category = producto.category?.trim() || "General"
  const stockQuantity = producto.stock_quantity?.trim() || "0"
  const simpleDescription =
    producto.simple_description?.trim() || ""

  if (!code || !name) {
    continue
  }

  if (excludedCategories.has(category)) {
  continue
}

  const venta = ventasByCode.get(code)
  const ajuste = ajustesByCode.get(code)

  const manualOrderRaw = ajuste?.manual_order?.trim()
  const hasManualOrder =
    manualOrderRaw !== undefined &&
    manualOrderRaw !== "" &&
    Number.isFinite(Number(manualOrderRaw)) &&
    Number(manualOrderRaw) > 0

  const visible = normalizeVisible(
    ajuste?.visible,
    normalizeVisible(producto.visible, "1")
  )

  const ventaOrder = toNumber(
    venta?.display_order_sugerido,
    999999
  )

  const baseRow = {
    code,
    name,
    category,
    stock_quantity: stockQuantity,
    simple_description: simpleDescription,
    visible,
  }

  if (hasManualOrder) {
    manuales.push({
      ...baseRow,
      display_order: Math.floor(Number(manualOrderRaw)),
    })
  } else {
    automaticos.push({
      ...baseRow,
      display_order: ventaOrder,
    })
  }
}

manuales.sort((a, b) => {
  return Number(a.display_order) - Number(b.display_order)
})

automaticos.sort((a, b) => {
  const orderA = Number(a.display_order)
  const orderB = Number(b.display_order)

  if (orderA !== orderB) {
    return orderA - orderB
  }

  return String(a.name).localeCompare(String(b.name))
})

const rows = [...manuales, ...automaticos].map((row, index) => ({
  ...row,
  display_order: index + 1,
}))

fs.writeFileSync(outputFile, "\uFEFF" + toCsv(rows), "utf8")

console.log(`Archivo generado: ${outputFile}`)
console.log(`Productos base leídos: ${productos.length}`)
console.log(`Productos con orden manual: ${manuales.length}`)
console.log(`Productos con orden automático: ${automaticos.length}`)
console.log(`Productos finales: ${rows.length}`)