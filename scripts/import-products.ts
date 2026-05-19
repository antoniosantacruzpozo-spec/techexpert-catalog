import "dotenv/config"

import fs from "fs"
import path from "path"
import { parse } from "csv-parse/sync"

import { PrismaClient } from "../src/generated/prisma/client"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({
  adapter,
})

async function main() {
  const filePath = path.join(process.cwd(), "productos.csv")
  const fileContent = fs.readFileSync(filePath, "utf-8")

  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    delimiter: ";",
    bom: true,
    trim: true,
  })

  for (const row of records) {
    const code = String(row.code || "").trim()
    const name = String(row.name || "").trim()
    const categoryName = String(row.category || "").trim()
    const stockQuantity = Number(row.stock_quantity || 0)
    const simpleDescription = String(row.simple_description || "").trim()

    if (!code) {
      console.log("⚠️ Producto omitido porque no tiene código:", row)
      continue
    }

    if (!name) {
      console.log("⚠️ Producto omitido porque no tiene nombre:", row)
      continue
    }

    const category = await prisma.category.upsert({
      where: {
        slug: categoryName.toLowerCase().replace(/\s+/g, "-"),
      },
      update: {
        erpName: categoryName,
        publicName: categoryName,
      },
      create: {
        erpName: categoryName,
        publicName: categoryName,
        slug: categoryName.toLowerCase().replace(/\s+/g, "-"),
      },
    })

    await prisma.product.upsert({
      where: {
        code,
      },
      update: {
        name,
        simpleDescription,
        stockQuantity,
        inStock: stockQuantity > 0,
        categoryId: category.id,
      },
      create: {
        code,
        name,
        simpleDescription,
        stockQuantity,
        inStock: stockQuantity > 0,
        categoryId: category.id,
      },
    })

    console.log(`✅ Producto importado: ${code} - ${name}`)
  }

  console.log("🎉 Importación finalizada")
}

main()
  .catch((error) => {
    console.error(error)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })