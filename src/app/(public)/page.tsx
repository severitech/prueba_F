// app/page.tsx
import Link from "next/link";
import CantidadDeCompras from "../components/CantidadDeCompras";
import MarcasCarousel from "../components/CarruselDeMarcas";
import TarjetaDeProductos from "../components/TarjetaDeProductos";

export default function Page() {
  return (
    <section className="min-h-screen">
      <div className="mb-3 z-0">
        <CantidadDeCompras />
      </div>
      <div className="mb-3">
        <MarcasCarousel />
      </div>

      <div className="mb-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Productos Destacados</h2>
          <p className="text-muted-foreground">
            Descubre nuestra selección de productos más populares
          </p>
        </div>
        <TarjetaDeProductos cantidadProductos={9} />
      </div>

      <div className="text-center py-12 bg-muted rounded-lg mt-12">
        <h3 className="text-2xl font-bold mb-4">
          ¿No encuentras lo que buscas?
        </h3>
        <p className="text-muted-foreground mb-6">
          Explora nuestro catálogo completo de productos
        </p>
        <Link href={"/productos"}>
          <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors">
            Ver Todos los Productos
          </button>
        </Link>
      </div>
    </section>
  );
}
