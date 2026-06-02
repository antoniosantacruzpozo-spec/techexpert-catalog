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

const WHATSAPP_NUMBER = "593999153775"

export function ProductCatalog({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todas")
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([])

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

  const toggleSelectedProduct = (product: Product) => {
    const alreadySelected = selectedProducts.some(
      (selectedProduct) => selectedProduct.id === product.id
    )

    if (alreadySelected) {
      setSelectedProducts((currentProducts) =>
        currentProducts.filter(
          (selectedProduct) => selectedProduct.id !== product.id
        )
      )
      return
    }

    setSelectedProducts((currentProducts) => [...currentProducts, product])
  }

  const selectedMessage = `Hola, quiero consultar por estos productos:%0A%0A${selectedProducts
    .map(
      (product, index) =>
        `${index + 1}. ${product.name} - Código: ${product.code}`
    )
    .join("%0A")}`

  const selectedWhatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${selectedMessage}`

  return (
    <main className="min-h-screen bg-gray-100 pb-32">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 p-3 sm:gap-4 sm:p-4">
          <img
            src="/logo/techexpert-logo.png"
            alt="TECHexpert Logo"
            className="h-10 w-auto object-contain sm:h-14"
          />

          <div>
            <h1 className="text-2xl font-black text-blue-700 sm:text-3xl">
              TECHexpert
            </h1>

            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              Catálogo tecnológico
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 p-3 sm:p-4">
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

        <section className="min-w-0 flex-1">
          <div className="sticky top-0 z-30 mb-4 rounded-2xl bg-white p-3 shadow-md md:hidden">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Producto o código..."
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-base outline-none focus:border-blue-600"
            />

            <p className="mt-3 text-xs font-bold text-gray-400">
              {filteredProducts.length} productos
            </p>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-black ${
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => {
              const message = `Hola, quiero consultar por el producto ${product.name} código ${product.code}`
              const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
              const isSelected = selectedProducts.some(
                (selectedProduct) => selectedProduct.id === product.id
              )

              return (
                <div
                  key={product.id}
                  className="group overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative bg-gray-100">
                  <img
                    src={`/products/${product.code}.JPG`}
                    alt={product.name}
                    className="aspect-[4/3] w-full bg-white object-contain p-3 transition duration-300 group-hover:scale-105 sm:aspect-square"
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

                  <div className="flex min-h-[230px] flex-col p-4 sm:min-h-[240px]">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-blue-700">
                      {product.category?.publicName ?? "Sin categoría"}
                    </p>

                    <h2 className="mt-2 line-clamp-2 text-base font-black leading-snug text-gray-900 sm:text-sm">
                      {product.name}
                    </h2>

                    <p className="mt-2 text-sm text-gray-500 sm:text-xs">
                      Código:{" "}
                      <span className="font-bold text-gray-700">
                        {product.code}
                      </span>
                    </p>

                    {product.simpleDescription && (
                      <p className="mt-2 line-clamp-2 text-sm text-gray-500 sm:text-xs">
                        {product.simpleDescription}
                      </p>
                    )}

                    <div className="mt-auto space-y-2 pt-4">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        className="block rounded-2xl bg-green-500 px-3 py-4 text-center text-sm font-black text-white transition hover:bg-green-600 sm:py-3 sm:text-xs"
                      >
                        Consultar
                      </a>

                      <button
                        type="button"
                        onClick={() => toggleSelectedProduct(product)}
                        className={`w-full rounded-2xl px-3 py-4 text-sm font-black transition sm:py-3 sm:text-xs ${
                          isSelected
                            ? "bg-blue-700 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-blue-50"
                        }`}
                      >
                        {isSelected
                          ? "Agregado a consulta"
                          : "Agregar a consulta"}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      {selectedProducts.length > 0 && (
        <div className="fixed bottom-3 left-3 right-3 z-50 mx-auto max-w-3xl rounded-3xl bg-white p-3 shadow-2xl ring-1 ring-gray-200 sm:bottom-4 sm:left-4 sm:right-4 sm:p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black text-gray-900">
                {selectedProducts.length} producto
                {selectedProducts.length === 1 ? "" : "s"} en consulta
              </p>

              <p className="text-xs text-gray-500">
                Puedes enviar todos juntos por WhatsApp.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedProducts([])}
                className="rounded-2xl bg-gray-100 px-4 py-3 text-xs font-black text-gray-700"
              >
                Vaciar
              </button>

              <a
                href={selectedWhatsappUrl}
                target="_blank"
                className="rounded-2xl bg-green-500 px-4 py-3 text-center text-xs font-black text-white"
              >
                Consultar selección
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}