import fs from "fs"
import * as XLSX from "xlsx"

const inputFile = "movimientos.xls"
const resumenOutput = "ventas_articulos_curado.csv"
const detalleOutput = "ventas_articulos_detalle_movimientos.csv"

type ProductoResumen = {
  code: string
  name: string
  ventasCantidad: number
  ingresosCantidad: number
  stockActual: number
  movimientosVenta: number
}

type MovimientoDetalle = {
  code: string
  name: string
  fecha: string
  detalle: string
  comprobante: string
  bodega: string
  tp: number
  ingresoCantidad: number
  egresoCantidad: number
  stockCantidad: number
}

function clean(value: unknown) {
  return String(value ?? "").trim()
}

function toNumber(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function isProductHeader(value: unknown) {
  const text = clean(value)
  return /^\d{4,}/.test(text)
}

function parseProductHeader(value: unknown) {
  const text = clean(value)
  const match = text.match(/^(\d+)\s+(.+?)\s+Unidad:/)

  if (!match) {
    return null
  }

  return {
    code: match[1].trim(),
    name: match[2].trim().replace(/\s+/g, " "),
  }
}

function isDateRow(value: unknown) {
  const text = clean(value)
  return /^\d{2}\/\d{2}\/\d{2}$/.test(text)
}

function csvEscape(value: unknown) {
  const text = String(value ?? "")
  if (text.includes(";") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

function toCsv(rows: Record<string, unknown>[]) {
  if (rows.length === 0) return ""

  const headers = Object.keys(rows[0])

  return [
    headers.join(";"),
    ...rows.map((row) =>
      headers.map((header) => csvEscape(row[header])).join(";")
    ),
  ].join("\n")
}

const workbook = XLSX.readFile(inputFile)
const sheetName = workbook.SheetNames[0]
const sheet = workbook.Sheets[sheetName]

const rows = XLSX.utils.sheet_to_json(sheet, {
  header: 1,
  defval: "",
}) as unknown[][]

const productos = new Map<string, ProductoResumen>()
const detalles: MovimientoDetalle[] = []

let currentProduct: { code: string; name: string } | null = null

for (const row of rows) {
  const firstCell = row[0]

  if (isProductHeader(firstCell)) {
    const product = parseProductHeader(firstCell)

    if (product) {
      currentProduct = product

      if (!productos.has(product.code)) {
        productos.set(product.code, {
          code: product.code,
          name: product.name,
          ventasCantidad: 0,
          ingresosCantidad: 0,
          stockActual: 0,
          movimientosVenta: 0,
        })
      }
    }

    continue
  }

  if (!currentProduct || !isDateRow(firstCell)) {
    continue
  }

  const fecha = clean(row[0])
  const detalle = clean(row[1])
  const comprobante = clean(row[2])
  const bodega = clean(row[3])
  const tp = toNumber(row[4])

  const ingresoCantidad = toNumber(row[5])
  const egresoCantidad = toNumber(row[7])
  const stockCantidad = toNumber(row[9])

  const resumen = productos.get(currentProduct.code)

  if (!resumen) {
    continue
  }

  resumen.stockActual = stockCantidad

  if (tp === 10) {
    resumen.ingresosCantidad += ingresoCantidad
  }

  if (tp === 50) {
    resumen.ventasCantidad += egresoCantidad
    resumen.movimientosVenta += 1
  }

  detalles.push({
    code: currentProduct.code,
    name: currentProduct.name,
    fecha,
    detalle,
    comprobante,
    bodega,
    tp,
    ingresoCantidad,
    egresoCantidad,
    stockCantidad,
  })
}

const resumenOrdenado = Array.from(productos.values())
  .sort((a, b) => {
    if (b.ventasCantidad !== a.ventasCantidad) {
      return b.ventasCantidad - a.ventasCantidad
    }

    return a.name.localeCompare(b.name)
  })
  .map((product, index) => ({
    code: product.code,
    name: product.name,
    ventas_cantidad: product.ventasCantidad,
    ingresos_cantidad: product.ingresosCantidad,
    stock_actual: product.stockActual,
    movimientos_venta: product.movimientosVenta,
    display_order_sugerido:
      product.ventasCantidad > 0 ? index + 1 : 999999,
    visible_sugerido: 1,
  }))

fs.writeFileSync(resumenOutput, toCsv(resumenOrdenado), "utf8")
fs.writeFileSync(detalleOutput, toCsv(detalles), "utf8")

console.log(`Archivo generado: ${resumenOutput}`)
console.log(`Archivo generado: ${detalleOutput}`)
console.log(`Productos procesados: ${resumenOrdenado.length}`)
console.log(`Movimientos procesados: ${detalles.length}`)