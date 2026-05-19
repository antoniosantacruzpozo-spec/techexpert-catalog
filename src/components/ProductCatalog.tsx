"use client"

import { useState } from "react"

type Product = {
  id: number
  code: string
  name: string
  simpleDescription: string | null
  inStock: boolean
  category: {
    publicName: string
  } | null
}

const WHATSAPP_NUMBER = "593984615551"

export function ProductCatalog({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todas")

  const categories = [
    "Todas",
    ...(Array.from(
      new Set(
        products
          .map((product) => product.category?.publicName)
          .filter(Boolean)
      )
    ) as string[]),
  ]

  const filteredProducts = products.filter((product) => {
    const categoryName = product.category?.publicName ?? ""

    const matchesSearch = `${product.name} ${product.code} ${categoryName}`
      .toLowerCase()
      .includes(search.toLowerCase())

    const matchesCategory =
      selectedCategory === "Todas" || categoryName === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl p-4">
          <h1 className="text-3xl font-black text-blue-700">TECHexpert</h1>
          <p className="mt-1 text-sm text-gray-500">Catálogo tecnológico</p>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 p-4">
        <aside className="hidden w-64 shrink-0 rounded-3xl bg-white p-4 shadow-md md:block">
          <h2 className="text-sm font-black uppercase text-gray-700">
            Buscar
          </h2>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Producto o código..."
            className="mt-4 w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
          />

          <p className="mt-4 text-xs text-gray-400">
            {filteredProducts.length} productos
          </p>

          <div className="mt-6 border-t pt-4">
            <h2 className="text-sm font-black uppercase text-gray-700">
              Categorías
            </h2>

            <div className="mt-3 space-y-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full rounded-2xl px-4 py-3 text-left text-xs font-bold transition ${
                    selectedCategory === category
                      ? "bg-blue-700 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-blue-50"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="flex-1">
          <div className="mb-4 rounded-3xl bg-white p-4 shadow-md md:hidden">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Producto o código..."
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
            />

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`whitespace-nowrap rounded-2xl px-4 py-2 text-xs font-bold ${
                    selectedCategory === category
                      ? "bg-blue-700 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => {
              const message = `Hola, quiero consultar por el producto ${product.name} código ${product.code}`
              const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`

              return (
                <div
                  key={product.id}
                  className="group overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative bg-gray-100">
                    <img
                      src={`/products/${product.code}.JPG`}
                      alt={product.name}
                      className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
                    />

                    <span
                      className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-black uppercase shadow-sm ${
                        product.inStock
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.inStock ? "Stock" : "Sin stock"}
                    </span>
                  </div>

                  <div className="flex min-h-[190px] flex-col p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-blue-700">
                      {product.category?.publicName ?? "Sin categoría"}
                    </p>

                    <h2 className="mt-2 line-clamp-2 text-sm font-black leading-snug text-gray-900">
                      {product.name}
                    </h2>

                    <p className="mt-2 text-xs text-gray-500">
                      Código:{" "}
                      <span className="font-bold text-gray-700">
                        {product.code}
                      </span>
                    </p>

                    {product.simpleDescription && (
                      <p className="mt-2 line-clamp-2 text-xs text-gray-500">
                        {product.simpleDescription}
                      </p>
                    )}

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      className="mt-auto block rounded-2xl bg-green-500 px-3 py-3 text-center text-xs font-black text-white transition hover:bg-green-600"
                    >
                      Consultar
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}