// src/api/ventas.service.ts


import { Venta } from "@/interface/venta";
import { utilidadesAutenticacion } from "@/lib/autenticacion";

class ServicioVentas {
  private urlBase =
    process.env.NEXT_PUBLIC_API_URL || "https://web-production-de7b5.up.railway.app/api";

  /**
   * Método principal para obtener ventas
   */
  // src/api/ventas.service.ts
  async obtenerMisVentas(): Promise<{ ventas: Venta[]; total: number }> {
    try {
      const token = utilidadesAutenticacion.obtenerToken();

      if (!token) {
        throw new Error(
          "No hay token de autenticación. Por favor inicia sesión."
        );
      }

      // Obtener usuario actual
      const usuarioActual = utilidadesAutenticacion.obtenerUsuario();
      if (!usuarioActual || !usuarioActual.id) {
        throw new Error("No se pudo obtener información del usuario");
      }

      console.log("🔍 Obteniendo ventas para usuario:", usuarioActual.id);

      // Obtener todas las ventas
      const respuestaVentas = await fetch(`${this.urlBase}/ventas/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      if (!respuestaVentas.ok) {
        throw new Error(
          `Error ${respuestaVentas.status}: ${respuestaVentas.statusText}`
        );
      }

      const datosVentas = await respuestaVentas.json();
      console.log("📦 Respuesta completa de /ventas/:", datosVentas);

      // Extraer ventas
      let todasLasVentas: any[] = [];
      if (Array.isArray(datosVentas)) {
        todasLasVentas = datosVentas;
      } else if (datosVentas.results && Array.isArray(datosVentas.results)) {
        todasLasVentas = datosVentas.results;
      }

      // FILTRAR por usuario actual
      const ventasDelUsuario = todasLasVentas.filter((venta) => {
        const usuarioId = venta.usuario?.id || venta.usuario_id;
        console.log(
          `🔍 Venta ${venta.id}: usuarioId=${usuarioId}, usuarioActual=${usuarioActual.id}`
        );
        return usuarioId === usuarioActual.id;
      });

      console.log(
        `📊 Ventas totales: ${todasLasVentas.length}, Ventas del usuario: ${ventasDelUsuario.length}`
      );

      if (ventasDelUsuario.length === 0) {
        return { ventas: [], total: 0 };
      }

      // Obtener detalles y pagos
      const todosLosDetalles = await this.obtenerTodosLosDetalles();
      const todosLosPagos = await this.obtenerTodosLosPagos();

      // Procesar ventas con detalles CORREGIDOS
      const ventasCompletas = ventasDelUsuario.map((venta) => {
        const detallesVenta = todosLosDetalles.filter((detalle: any) => {
          const ventaId =
            detalle.venta?.id || detalle.venta_id || detalle.venta;
          return ventaId === venta.id;
        });

        const pagosVenta = todosLosPagos.filter((pago: any) => {
          const ventaId = pago.venta?.id || pago.venta_id || pago.venta;
          return ventaId === venta.id;
        });

        console.log(
          `✅ Venta ${venta.id}: ${detallesVenta.length} detalles, ${pagosVenta.length} pagos`
        );

        return {
          ...venta,
          detalles: detallesVenta,
          pagos: pagosVenta,
        };
      });

      return {
        ventas: ventasCompletas,
        total: ventasDelUsuario.length,
      };
    } catch (error) {
      console.error("❌ Error obteniendo ventas:", error);
      throw error;
    }
  }

  private async obtenerTodosLosDetalles(): Promise<any[]> {
    try {
      const token = utilidadesAutenticacion.obtenerToken();
      const url = `${this.urlBase}/detalleventas/`;

      console.log("🔍 Obteniendo todos los detalles desde:", url);

      const respuesta = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      if (!respuesta.ok) {
        console.warn("⚠️ Error obteniendo detalles:", respuesta.status);
        return [];
      }

      const datos = await respuesta.json();
      console.log("📦 Respuesta completa de detalles:", datos);

      let detalles: any[] = [];
      if (Array.isArray(datos)) {
        detalles = datos;
      } else if (datos.results && Array.isArray(datos.results)) {
        detalles = datos.results;
      }

      console.log(`📊 Se encontraron ${detalles.length} detalles en total`);

      // Procesar detalles con manejo mejorado de imágenes
      const detallesCorregidos = await Promise.all(
        detalles.map(async (detalle: any) => {
          try {
            console.log("🔍 Procesando detalle:", detalle);

            let productoInfo: any = {};

            if (detalle.producto && typeof detalle.producto === "object") {
              if (
                detalle.producto.id &&
                typeof detalle.producto.id === "object"
              ) {
                // Caso: producto anidado incorrectamente
                productoInfo = {
                  id: detalle.producto.id.id,
                  descripcion: detalle.producto.id.descripcion,
                  precio: parseFloat(detalle.producto.id.precio) || 0,
                  categoria: detalle.producto.id.categoria,
                  imagen: this.procesarUrlImagen(detalle.producto.id.imagen),
                  subcategoria: detalle.producto.id.subcategoria,
                };
              } else {
                // Caso: estructura normal
                productoInfo = {
                  id: detalle.producto.id,
                  descripcion: detalle.producto.descripcion,
                  precio: parseFloat(detalle.producto.precio) || 0,
                  categoria: detalle.producto.categoria,
                  imagen: this.procesarUrlImagen(detalle.producto.imagen),
                  subcategoria: detalle.producto.subcategoria,
                };
              }
            } else {
              // Solo tenemos ID, obtener del API
              const productoId = detalle.producto;
              const producto = await this.obtenerProducto(productoId);
              productoInfo = producto;
            }

            console.log("✅ Producto corregido:", productoInfo);

            return {
              id: detalle.id,
              venta: detalle.venta,
              producto: productoInfo,
              cantidad: detalle.cantidad,
              subtotal: detalle.subtotal,
            };
          } catch (error) {
            console.warn("⚠️ Error procesando detalle:", error);
            return {
              id: detalle.id,
              venta: detalle.venta,
              producto: {
                id: 0,
                descripcion: "Producto no disponible",
                precio: 0,
                categoria: 0,
                imagen: null,
              },
              cantidad: detalle.cantidad,
              subtotal: detalle.subtotal,
            };
          }
        })
      );

      return detallesCorregidos;
    } catch (error) {
      console.warn("⚠️ Error obteniendo todos los detalles:", error);
      return [];
    }
  }

  // Nuevo método para procesar URLs de imágenes
  private procesarUrlImagen(imagen: string | null): string | null {
    if (!imagen) return null;

    // Si la imagen ya es una URL completa
    if (imagen.startsWith("http")) {
      return imagen;
    }

    // Si es una ruta relativa, convertir a URL absoluta
    if (imagen.startsWith("/")) {
      return `${this.urlBase}${imagen}`;
    }

    // Si es un nombre de archivo simple
    return `${this.urlBase}/media/${imagen}`;
  }

  private async obtenerProducto(productoId: number): Promise<any> {
    try {
      const token = utilidadesAutenticacion.obtenerToken();
      const url = `${this.urlBase}/productos/${productoId}/`;

      console.log(`🔍 Obteniendo producto ${productoId}: ${url}`);

      const respuesta = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      if (!respuesta.ok) {
        console.warn(`⚠️ No se pudo obtener producto ${productoId}`);
        return {
          id: productoId,
          descripcion: `Producto #${productoId}`,
          precio: 0,
          categoria: 0,
          imagen: null,
        };
      }

      const producto = await respuesta.json();
      console.log(`✅ Producto ${productoId} obtenido:`, producto);

      return {
        id: producto.id,
        descripcion: producto.descripcion,
        precio: parseFloat(producto.precio) || 0,
        categoria: producto.categoria,
        imagen: this.procesarUrlImagen(producto.imagen),
        subcategoria: producto.subcategoria,
      };
    } catch (error) {
      console.warn(`⚠️ Error obteniendo producto ${productoId}:`, error);
      return {
        id: productoId,
        descripcion: `Producto #${productoId}`,
        precio: 0,
        categoria: 0,
        imagen: null,
      };
    }
  }
  /**
   * Obtener TODOS los pagos de una sola vez
   */
  private async obtenerTodosLosPagos(): Promise<any[]> {
    try {
      const token = utilidadesAutenticacion.obtenerToken();
      const url = `${this.urlBase}/pagos/`;

      console.log("🔍 Obteniendo todos los pagos desde:", url);

      const respuesta = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      if (!respuesta.ok) {
        console.warn("⚠️ Error obteniendo pagos:", respuesta.status);
        return [];
      }

      const datos = await respuesta.json();
      console.log("📦 Respuesta completa de pagos:", datos);

      // Extraer array de pagos
      let pagos: any[] = [];

      if (Array.isArray(datos)) {
        pagos = datos;
      } else if (datos.results && Array.isArray(datos.results)) {
        pagos = datos.results;
      }

      console.log(`📊 Se encontraron ${pagos.length} pagos en total`);
      return pagos;
    } catch (error) {
      console.warn("⚠️ Error obteniendo todos los pagos:", error);
      return [];
    }
  }

  /**
   * Obtener información de un producto
   */
 
  // Métodos de utilidad (se mantienen igual)
  formatearFecha(fecha: string): string {
    try {
      return new Date(fecha).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Fecha no disponible";
    }
  }

  formatearMoneda(monto: number): string {
    return new Intl.NumberFormat("es-BO", {
      style: "currency",
      currency: "BOB",
    }).format(monto);
  }

  obtenerColorEstado(estado: string): string {
    switch (estado) {
      case "Pagado":
        return "bg-green-100 text-green-800 border-green-200";
      case "Pendiente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Cancelado":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }

  obtenerIconoEstado(estado: string): string {
    switch (estado) {
      case "Pagado":
        return "✅";
      case "Pendiente":
        return "⏳";
      case "Cancelado":
        return "❌";
      default:
        return "📦";
    }
  }
}

export const servicioVentas = new ServicioVentas();
