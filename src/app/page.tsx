import { ProductCatalog } from "@/components/ProductCatalog"
import { prisma } from "@/lib/prisma"

export default async function Home() {
  const products = await prisma.product.findMany({
    where: {
      visible: true,
    },
    include: {
      category: true,
    },
    orderBy: {
      name: "asc",
    },
  })

  return <ProductCatalog products={products} />
}