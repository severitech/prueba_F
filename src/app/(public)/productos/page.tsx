// app/productos/page.tsx
import TarjetaDeProductos from '@/app/components/TarjetaDeProductos'

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 dark:bg-zinc-900">
      <div className="container mx-auto mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Nuestros Productos</h1>
        <p className="text-muted-foreground text-center mb-8">
          Descubre nuestra amplia gama de electrodomésticos y tecnología
        </p>
        <TarjetaDeProductos cantidadProductos={null} />
      </div>
    </div>
  )
}