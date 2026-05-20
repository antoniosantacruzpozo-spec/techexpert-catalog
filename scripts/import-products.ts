import "dotenv/config"

import fs from "fs"
import path from "path"
import { parse } from "csv-parse/sync"
import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL no está configurado")
}

const pool = new Pool({
  connectionString,
})

const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({
  adapter,
})

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
    delimiter: ";",
    relax_quotes: true,
    bom: true,
  }) as Record<string, string>[]

  let imported = 0

  for (const record of records) {
    const code = record.code?.trim()
    const name = record.name?.trim()
    const categoryName = record.category?.trim() || "General"
    const simpleDescription =
      record.simple_description?.trim() || null

    const stockQuantity =
      Number(record.stock_quantity?.trim()) || 0

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

    imported++
  }

  console.log(
    `Importados correctamente ${imported} productos`
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })