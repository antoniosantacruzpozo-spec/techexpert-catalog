import "dotenv/config"

import fs from "fs"
import path from "path"
import { parse } from "csv-parse/sync"
import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"

const connectionString = process.env.DATABASE_URL!

const pool = new Pool({
  connectionString,
})

const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({
  adapter,
})

type CsvProduct = {
  Codigo?: string
  codigo?: string
  Nombre?: string
  nombre?: string
  Categoria?: string
  categoria?: string
  Descripcion?: string
  descripcion?: string
  Stock?: string
  stock?: string
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

async function main() {
  const csvPath = path.join(process.cwd(), "productos.csv")

  const fileContent = fs.readFileSync(csvPath, "utf8")

  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as CsvProduct[]

  for (const record of records) {
    const code = record.Codigo ?? record.codigo
    const name = record.Nombre ?? record.nombre
    const categoryName = record.Categoria ?? record.categoria ?? "General"
    const simpleDescription =
      record.Descripcion ?? record.descripcion ?? null

    const stockText = record.Stock ?? record.stock ?? "0"
    const stockQuantity = Number(stockText) || 0

    if (!code || !name) {
      continue
    }

    const category = await prisma.category.upsert({
      where: {
        slug: slugify(categoryName),
      },
      update: {
        erpName: categoryName,
        publicName: categoryName,
      },
      create: {
        erpName: categoryName,
        publicName: categoryName,
        slug: slugify(categoryName),
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
        visible: true,
        categoryId: category.id,
      },
      create: {
        code,
        name,
        simpleDescription,
        stockQuantity,
        inStock: stockQuantity > 0,
        visible: true,
        categoryId: category.id,
      },
    })
  }

  console.log(`Importados ${records.length} productos`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })