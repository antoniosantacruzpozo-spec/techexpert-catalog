import * as XLSX from "xlsx"

const workbook = XLSX.readFile("movimientos.xls")

console.log("Hojas encontradas:")
console.log(workbook.SheetNames)

for (const sheetName of workbook.SheetNames) {
  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
  }) as unknown[][]

  console.log(`\nHoja: ${sheetName}`)
  console.log(`Filas: ${rows.length}`)
  console.log("Primeras 20 filas:")

  rows.slice(0, 20).forEach((row, index) => {
    console.log(index + 1, row)
  })
}