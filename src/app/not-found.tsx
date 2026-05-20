export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-6 text-center shadow-md">
        <h1 className="text-2xl font-black text-blue-700">
          Página no encontrada
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          La página que buscas no existe.
        </p>

        <a
          href="/"
          className="mt-6 inline-block rounded-2xl bg-blue-700 px-5 py-3 text-sm font-black text-white"
        >
          Volver al catálogo
        </a>
      </div>
    </main>
  )
}