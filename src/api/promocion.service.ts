// api/promociones.service.ts
import {
  Promocion,
  ProductoPromocion,
  DatosCrearPromocion,
  DatosActualizarPromocion,
  DatosCrearProductoPromocion,
  DatosCrearPromocionConProductos,
  DatosActualizarPromocionConProductos,
  RespuestaPromociones,
  RespuestaPromocion,
  RespuestaProductoPromociones,
  RespuestaProductoPromocion,
  FiltrosPromocionesInterface,
  FiltrosProductoPromocionInterface,
} from "@/interface/promocion";
import { utilidadesAutenticacion } from "@/lib/autenticacion";

class ServicioPromociones {
  private urlBase =
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  private obtenerHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const token = utilidadesAutenticacion.obtenerToken();
    if (token) {
      headers["Authorization"] = `Token ${token}`;
    }

    return headers;
  }

  // ========== CRUD PROMOCIONES ==========

  async obtenerPromociones(
    filtros: FiltrosPromocionesInterface = {}
  ): Promise<RespuestaPromociones> {
    try {
      const parametros = new URLSearchParams();

      if (filtros.buscar) parametros.append("search", filtros.buscar);
      if (filtros.estado !== undefined)
        parametros.append("estado", filtros.estado.toString());
      if (filtros.fecha_inicio_desde)
        parametros.append("fecha_inicio_desde", filtros.fecha_inicio_desde);
      if (filtros.fecha_inicio_hasta)
        parametros.append("fecha_inicio_hasta", filtros.fecha_inicio_hasta);
      if (filtros.fecha_fin_desde)
        parametros.append("fecha_fin_desde", filtros.fecha_fin_desde);
      if (filtros.fecha_fin_hasta)
        parametros.append("fecha_fin_hasta", filtros.fecha_fin_hasta);
      if (filtros.monto_min)
        parametros.append("monto_min", filtros.monto_min.toString());
      if (filtros.monto_max)
        parametros.append("monto_max", filtros.monto_max.toString());
      if (filtros.pagina) parametros.append("page", filtros.pagina.toString());
      if (filtros.limite)
        parametros.append("page_size", filtros.limite.toString());

      const url = `${this.urlBase}/promociones/${
        parametros.toString() ? `?${parametros.toString()}` : ""
      }`;

      const respuesta = await fetch(url, {
        method: "GET",
        headers: this.obtenerHeaders(),
      });

      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
      }

      const datos = await respuesta.json();

      let promociones: Promocion[] = [];
      let total = 0;
      let paginaActual = 1;
      let totalPaginas = 1;

      if (Array.isArray(datos)) {
        promociones = datos;
        total = datos.length;
      } else if (datos.results && Array.isArray(datos.results)) {
        promociones = datos.results;
        total = datos.count || datos.results.length;
        paginaActual = datos.current_page || 1;
        totalPaginas =
          datos.total_pages || Math.ceil(total / (filtros.limite || 10));
      } else {
        promociones = datos;
        total = 1;
      }

      return {
        exito: true,
        datos: promociones,
        paginacion: {
          total,
          paginaActual,
          totalPaginas,
          limite: filtros.limite || 10,
        },
      };
    } catch (error) {
      console.error("❌ Error obteniendo promociones:", error);
      return {
        exito: false,
        datos: [],
        mensaje:
          error instanceof Error
            ? error.message
            : "Error al obtener promociones",
      };
    }
  }

  async obtenerPromocionPorId(id: number): Promise<RespuestaPromocion> {
    try {
      const respuesta = await fetch(`${this.urlBase}/promociones/${id}/`, {
        method: "GET",
        headers: this.obtenerHeaders(),
      });

      if (!respuesta.ok) {
        if (respuesta.status === 404) {
          throw new Error("Promoción no encontrada");
        }
        throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
      }

      const datos = await respuesta.json();

      return {
        exito: true,
        datos: datos,
      };
    } catch (error) {
      console.error("❌ Error obteniendo promoción:", error);
      return {
        exito: false,
        datos: {} as Promocion,
        mensaje:
          error instanceof Error ? error.message : "Error al obtener promoción",
      };
    }
  }

  async crearPromocion(
    datosPromocion: DatosCrearPromocion
  ): Promise<RespuestaPromocion> {
    try {
      const cuerpo = {
        fecha_inicio: datosPromocion.fecha_inicio,
        fecha_fin: datosPromocion.fecha_fin,
        descripcion: datosPromocion.descripcion,
        monto: parseFloat(datosPromocion.monto.toString()),
        estado:
          datosPromocion.estado !== undefined ? datosPromocion.estado : true,
      };

      console.log("📤 Creando promoción:", cuerpo);

      const respuesta = await fetch(`${this.urlBase}/promociones/`, {
        method: "POST",
        headers: this.obtenerHeaders(),
        body: JSON.stringify(cuerpo),
      });

      if (!respuesta.ok) {
        const errorData = await respuesta.json().catch(() => ({}));
        console.error("❌ Error del backend:", errorData);

        let mensajeError = `Error ${respuesta.status}: ${respuesta.statusText}`;
        if (errorData.detail) {
          mensajeError = errorData.detail;
        } else if (errorData.message) {
          mensajeError = errorData.message;
        } else if (typeof errorData === "object") {
          const erroresCampo = Object.entries(errorData)
            .map(
              ([campo, errores]) =>
                `${campo}: ${
                  Array.isArray(errores) ? errores.join(", ") : errores
                }`
            )
            .join("; ");
          if (erroresCampo) {
            mensajeError = erroresCampo;
          }
        }

        throw new Error(mensajeError);
      }

      const datos = await respuesta.json();

      return {
        exito: true,
        datos: datos,
        mensaje: "Promoción creada exitosamente",
      };
    } catch (error) {
      console.error("❌ Error creando promoción:", error);
      return {
        exito: false,
        datos: {} as Promocion,
        mensaje:
          error instanceof Error ? error.message : "Error al crear promoción",
      };
    }
  }

  /**
   * CREAR PROMOCIÓN CON PRODUCTOS - CORREGIDO
   */
  async crearPromocionConProductos(
    datosPromocion: DatosCrearPromocionConProductos
  ): Promise<RespuestaPromocion> {
    try {
      console.log(
        "📥 Datos recibidos para crear promoción con productos:",
        datosPromocion
      );

      // 1. Primero crear la promoción
      const resultadoPromocion = await this.crearPromocion(datosPromocion);

      if (!resultadoPromocion.exito) {
        throw new Error(
          resultadoPromocion.mensaje || "Error al crear la promoción"
        );
      }

      const promocionCreada = resultadoPromocion.datos;
      console.log("✅ Promoción creada exitosamente:", promocionCreada);

      // 2. Luego crear las relaciones producto-promoción
      if (
        datosPromocion.productos_ids &&
        datosPromocion.productos_ids.length > 0
      ) {
        console.log(
          "🔗 Creando relaciones con productos:",
          datosPromocion.productos_ids
        );

        const resultadoRelaciones = await this.crearRelacionesProductoPromocion(
          promocionCreada.id,
          datosPromocion.productos_ids
        );

        if (!resultadoRelaciones.exito) {
          console.warn(
            "⚠️ Algunas relaciones no se crearon correctamente:",
            resultadoRelaciones.mensaje
          );
        } else {
          console.log(
            "✅ Todas las relaciones producto-promoción creadas exitosamente"
          );
        }
      } else {
        console.log("ℹ️ No se proporcionaron productos para asociar.");
      }

      // 3. Obtener la promoción completa con sus relaciones
      const promocionCompleta = await this.obtenerPromocionPorId(
        promocionCreada.id
      );

      return {
        exito: true,
        datos: promocionCompleta.datos,
        mensaje:
          "Promoción creada exitosamente" +
          (datosPromocion.productos_ids?.length > 0
            ? " con productos asociados"
            : ""),
      };
    } catch (error) {
      console.error("❌ Error creando promoción con productos:", error);
      return {
        exito: false,
        datos: {} as Promocion,
        mensaje:
          error instanceof Error
            ? error.message
            : "Error al crear promoción con productos",
      };
    }
  }

  async actualizarPromocion(
    id: number,
    datosActualizacion: Partial<DatosActualizarPromocion>
  ): Promise<RespuestaPromocion> {
    try {
      console.log("📤 Actualizando promoción:", datosActualizacion);

      const respuesta = await fetch(`${this.urlBase}/promociones/${id}/`, {
        method: "PATCH",
        headers: this.obtenerHeaders(),
        body: JSON.stringify(datosActualizacion),
      });

      if (!respuesta.ok) {
        const errorData = await respuesta.json().catch(() => ({}));
        console.error("❌ Error del backend:", errorData);

        let mensajeError = `Error ${respuesta.status}: ${respuesta.statusText}`;
        if (errorData.detail) {
          mensajeError = errorData.detail;
        } else if (errorData.message) {
          mensajeError = errorData.message;
        } else if (typeof errorData === "object") {
          const erroresCampo = Object.entries(errorData)
            .map(
              ([campo, errores]) =>
                `${campo}: ${
                  Array.isArray(errores) ? errores.join(", ") : errores
                }`
            )
            .join("; ");
          if (erroresCampo) {
            mensajeError = erroresCampo;
          }
        }

        throw new Error(mensajeError);
      }

      const datos = await respuesta.json();

      return {
        exito: true,
        datos: datos,
        mensaje: "Promoción actualizada exitosamente",
      };
    } catch (error) {
      console.error("❌ Error actualizando promoción:", error);
      return {
        exito: false,
        datos: {} as Promocion,
        mensaje:
          error instanceof Error
            ? error.message
            : "Error al actualizar promoción",
      };
    }
  }

  /**
   * ACTUALIZAR PROMOCIÓN CON PRODUCTOS - CORREGIDO
   */

  async actualizarPromocionConProductos(
    id: number,
    datosActualizacion: DatosActualizarPromocionConProductos
  ): Promise<RespuestaPromocion> {
    try {
      console.log(
        "📤 Actualizando promoción con productos:",
        datosActualizacion
      );

      // 1. Actualizar datos básicos de la promoción (si existen)
      // CORRECCIÓN: Usar productos_ids en lugar de products_ids
      const { productos_ids, ...datosPromocion } = datosActualizacion;

      if (Object.keys(datosPromocion).length > 0) {
        console.log("📤 Actualizando datos de promoción:", datosPromocion);
        await this.actualizarPromocion(id, datosPromocion);
      }

      // 2. Actualizar relaciones producto-promoción (si se proporcionan productos_ids)
      if (productos_ids !== undefined) {
        console.log("🔄 Actualizando relaciones con productos:", productos_ids);

        // Primero obtener relaciones existentes
        const relacionesExistentes = await this.obtenerProductosPorPromocion(
          id
        );

        if (relacionesExistentes.exito) {
          // Eliminar relaciones existentes
          for (const relacion of relacionesExistentes.datos) {
            await this.eliminarProductoPromocion(relacion.id);
          }
          console.log("🗑️ Relaciones existentes eliminadas");
        }

        // Crear nuevas relaciones
        if (productos_ids.length > 0) {
          const resultadoRelaciones =
            await this.crearRelacionesProductoPromocion(id, productos_ids);
          if (!resultadoRelaciones.exito) {
            console.warn(
              "⚠️ Algunas relaciones no se crearon correctamente:",
              resultadoRelaciones.mensaje
            );
          } else {
            console.log("✅ Nuevas relaciones creadas exitosamente");
          }
        }
      }

      // 3. Obtener la promoción actualizada
      const promocionActualizada = await this.obtenerPromocionPorId(id);

      return {
        exito: true,
        datos: promocionActualizada.datos,
        mensaje:
          "Promoción actualizada exitosamente" +
          (datosActualizacion.productos_ids !== undefined
            ? " con productos"
            : ""),
      };
    } catch (error) {
      console.error("❌ Error actualizando promoción con productos:", error);
      return {
        exito: false,
        datos: {} as Promocion,
        mensaje:
          error instanceof Error
            ? error.message
            : "Error al actualizar promoción con productos",
      };
    }
  }

  async eliminarPromocion(
    id: number
  ): Promise<{ exito: boolean; mensaje?: string }> {
    try {
      const respuesta = await fetch(`${this.urlBase}/promociones/${id}/`, {
        method: "DELETE",
        headers: this.obtenerHeaders(),
      });

      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
      }

      return {
        exito: true,
        mensaje: "Promoción eliminada exitosamente",
      };
    } catch (error) {
      console.error("❌ Error eliminando promoción:", error);
      return {
        exito: false,
        mensaje:
          error instanceof Error
            ? error.message
            : "Error al eliminar promoción",
      };
    }
  }

  // ========== CRUD PRODUCTO_PROMOCION ==========

  async obtenerProductoPromociones(
    filtros: FiltrosProductoPromocionInterface = {}
  ): Promise<RespuestaProductoPromociones> {
    try {
      const parametros = new URLSearchParams();

      if (filtros.producto_id)
        parametros.append("producto_id", filtros.producto_id.toString());
      if (filtros.promocion_id)
        parametros.append("promocion_id", filtros.promocion_id.toString());
      if (filtros.fecha_desde)
        parametros.append("fecha_desde", filtros.fecha_desde);
      if (filtros.fecha_hasta)
        parametros.append("fecha_hasta", filtros.fecha_hasta);
      if (filtros.pagina) parametros.append("page", filtros.pagina.toString());
      if (filtros.limite)
        parametros.append("page_size", filtros.limite.toString());

      const url = `${this.urlBase}/productospromociones/${
        parametros.toString() ? `?${parametros.toString()}` : ""
      }`;

      const respuesta = await fetch(url, {
        method: "GET",
        headers: this.obtenerHeaders(),
      });

      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
      }

      const datos = await respuesta.json();

      let productoPromociones: ProductoPromocion[] = [];
      let total = 0;
      let paginaActual = 1;
      let totalPaginas = 1;

      if (Array.isArray(datos)) {
        productoPromociones = datos;
        total = datos.length;
      } else if (datos.results && Array.isArray(datos.results)) {
        productoPromociones = datos.results;
        total = datos.count || datos.results.length;
        paginaActual = datos.current_page || 1;
        totalPaginas =
          datos.total_pages || Math.ceil(total / (filtros.limite || 10));
      } else {
        productoPromociones = datos;
        total = 1;
      }

      return {
        exito: true,
        datos: productoPromociones,
        paginacion: {
          total,
          paginaActual,
          totalPaginas,
          limite: filtros.limite || 10,
        },
      };
    } catch (error) {
      console.error("❌ Error obteniendo producto-promociones:", error);
      return {
        exito: false,
        datos: [],
        mensaje:
          error instanceof Error
            ? error.message
            : "Error al obtener producto-promociones",
      };
    }
  }

  /**
   * CREAR PRODUCTO-PROMOCIÓN - CORREGIDO
   */
  async crearProductoPromocion(
    datosProductoPromocion: DatosCrearProductoPromocion
  ): Promise<RespuestaProductoPromocion> {
    try {
      // Usar el formato que espera tu backend según el serializer
      const cuerpo = {
        producto_id: datosProductoPromocion.producto_id,
        promocion_id: datosProductoPromocion.promocion_id,
      };

      console.log("📤 Enviando datos para crear producto-promoción:", cuerpo);
      const headers = this.obtenerHeaders();
      console.log("📤 Headers utilizados:", headers);

      const respuesta = await fetch(`${this.urlBase}/productospromociones/`, {
        method: "POST",
        headers,
        body: JSON.stringify(cuerpo),
      });

      const text = await respuesta.text();
      console.log("📥 Respuesta del backend (raw):", text);

      let datosParseados: unknown = {};
      try {
        datosParseados = text ? JSON.parse(text) : {};
      } catch {
        datosParseados = { raw: text };
      }

      if (!respuesta.ok) {
        const errorData =
          typeof datosParseados === "object" && datosParseados !== null
            ? (datosParseados as Record<string, unknown>)
            : { detail: text };
        console.error("❌ [FRONT] Error del backend:", errorData);
        let mensajeError = `Error ${respuesta.status}: ${respuesta.statusText}`;

        const detailValue = errorData["detail"];
        if (typeof detailValue === "string") {
          mensajeError = detailValue;
        } else if (Array.isArray(detailValue)) {
          mensajeError = detailValue.map(String).join(", ");
        } else {
          const messageValue = errorData["message"];
          if (typeof messageValue === "string") {
            mensajeError = messageValue;
          } else if (Array.isArray(messageValue)) {
            mensajeError = messageValue.map(String).join(", ");
          } else {
            const erroresCampo = Object.entries(errorData)
              .map(([campo, errores]) => {
                const valor = Array.isArray(errores)
                  ? errores.map(String).join(", ")
                  : String(errores);
                return `${campo}: ${valor}`;
              })
              .join("; ")
              .trim();
            if (erroresCampo) {
              mensajeError = erroresCampo;
            }
          }
        }
        if (typeof window !== "undefined") {
          window.alert("Error al crear producto-promoción: " + mensajeError);
        }
        throw new Error(mensajeError);
      }

      if (
        typeof datosParseados !== "object" ||
        datosParseados === null ||
        !("id" in datosParseados) ||
        !("fecha" in datosParseados) ||
        !("producto_id" in datosParseados) ||
        !("promocion_id" in datosParseados)
      ) {
        throw new Error(
          "Respuesta inválida del servidor al crear producto-promoción"
        );
      }

      const datos = datosParseados as ProductoPromocion;

      console.log("✅ [FRONT] Producto-promoción creado exitosamente:", datos);
      return {
        exito: true,
        datos,
        mensaje: "Producto agregado a promoción exitosamente",
      };
    } catch (error) {
      console.error("❌ [FRONT] Error creando producto-promoción:", error);
      if (typeof window !== "undefined") {
        window.alert(
          "Error creando producto-promoción: " +
            (error instanceof Error ? error.message : error)
        );
      }
      return {
        exito: false,
        datos: {} as ProductoPromocion,
        mensaje:
          error instanceof Error
            ? error.message
            : "Error al crear producto-promoción",
      };
    }
  }

  async eliminarProductoPromocion(
    id: number
  ): Promise<{ exito: boolean; mensaje?: string }> {
    try {
      const respuesta = await fetch(
        `${this.urlBase}/productospromociones/${id}/`,
        {
          method: "DELETE",
          headers: this.obtenerHeaders(),
        }
      );

      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
      }

      return {
        exito: true,
        mensaje: "Producto removido de promoción exitosamente",
      };
    } catch (error) {
      console.error("❌ Error eliminando producto-promoción:", error);
      return {
        exito: false,
        mensaje:
          error instanceof Error
            ? error.message
            : "Error al eliminar producto-promoción",
      };
    }
  }

  async obtenerProductosPorPromocion(
    promocionId: number
  ): Promise<RespuestaProductoPromociones> {
    try {
      const respuesta = await fetch(
        `${this.urlBase}/productospromociones/?promocion=${promocionId}`,
        {
          method: "GET",
          headers: this.obtenerHeaders(),
        }
      );

      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
      }

      const datos = await respuesta.json();
      console.log("📥 Productos por promoción:", datos);

      let productoPromociones: ProductoPromocion[] = [];
      if (Array.isArray(datos)) {
        productoPromociones = datos;
      } else if (datos.results && Array.isArray(datos.results)) {
        productoPromociones = datos.results;
      } else {
        productoPromociones = datos;
      }

      return {
        exito: true,
        datos: productoPromociones,
      };
    } catch (error) {
      console.error("❌ Error obteniendo productos por promoción:", error);
      return {
        exito: false,
        datos: [],
        mensaje:
          error instanceof Error
            ? error.message
            : "Error al obtener productos por promoción",
      };
    }
  }

  async obtenerPromocionesPorProducto(
    productoId: number
  ): Promise<RespuestaProductoPromociones> {
    try {
      const respuesta = await fetch(
        `${this.urlBase}/productospromociones/?producto_id=${productoId}`,
        {
          method: "GET",
          headers: this.obtenerHeaders(),
        }
      );

      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
      }

      const datos = await respuesta.json();

      let productoPromociones: ProductoPromocion[] = [];
      if (Array.isArray(datos)) {
        productoPromociones = datos;
      } else if (datos.results && Array.isArray(datos.results)) {
        productoPromociones = datos.results;
      } else {
        productoPromociones = datos;
      }

      return {
        exito: true,
        datos: productoPromociones,
      };
    } catch (error) {
      console.error("❌ Error obteniendo promociones por producto:", error);
      return {
        exito: false,
        datos: [],
        mensaje:
          error instanceof Error
            ? error.message
            : "Error al obtener promociones por producto",
      };
    }
  }

  async obtenerProductosDePromocion(promocionId: number): Promise<number[]> {
    try {
      const respuesta = await this.obtenerProductosPorPromocion(promocionId);
      if (respuesta.exito) {
        return respuesta.datos.map((pp) =>
          typeof pp.producto === "object" ? pp.producto.id : pp.producto_id
        );
      }
      return [];
    } catch (error) {
      console.error("Error obteniendo productos de promoción:", error);
      return [];
    }
  }

  // ========== MÉTODOS PRIVADOS CORREGIDOS ==========

  /**
   * CREAR RELACIONES PRODUCTO-PROMOCIÓN - CORREGIDO
   */
  private async crearRelacionesProductoPromocion(
    promocionId: number,
    productosIds: number[]
  ): Promise<{ exito: boolean; mensaje?: string }> {
    console.log(
      `🔗 [FRONT] Creando ${productosIds.length} relaciones para promoción ${promocionId}`
    );

    const resultados: boolean[] = [];
    const errores: string[] = [];

    for (const productoId of productosIds) {
      try {
        const resultado = await this.crearProductoPromocion({
          producto_id: productoId,
          promocion_id: promocionId,
        });

        if (resultado.exito) {
          resultados.push(true);
          console.log(`✅ [FRONT] Relación creada para producto ${productoId}`);
        } else {
          resultados.push(false);
          errores.push(`Producto ${productoId}: ${resultado.mensaje}`);
          console.error(
            `❌ [FRONT] Error creando relación para producto ${productoId}:`,
            resultado.mensaje
          );
        }
      } catch (error) {
        resultados.push(false);
        const mensajeError =
          error instanceof Error ? error.message : "Error desconocido";
        errores.push(`Producto ${productoId}: ${mensajeError}`);
        console.error(
          `❌ [FRONT] Error creando relación para producto ${productoId}:`,
          error
        );
      }
    }

    const exitos = resultados.filter((r) => r).length;
    const fallos = resultados.filter((r) => !r).length;

    console.log(`📊 [FRONT] Resultado: ${exitos} exitos, ${fallos} fallos`);

    if (fallos > 0) {
      return {
        exito: false,
        mensaje: `Se crearon ${exitos} de ${productosIds.length} relaciones. Errores: ${errores.join("; ")}`,
      };
    }

    return {
      exito: true,
      mensaje: `Todas las ${productosIds.length} relaciones creadas exitosamente`,
    };
  }

  // ========== UTILIDADES ==========

  validarPromocion(promocion: Partial<Promocion>): {
    valido: boolean;
    errores: string[];
  } {
    const errores: string[] = [];

    if (!promocion.descripcion || promocion.descripcion.trim().length === 0) {
      errores.push("La descripción es requerida");
    }

    if (!promocion.fecha_inicio) {
      errores.push("La fecha de inicio es requerida");
    }

    if (!promocion.fecha_fin) {
      errores.push("La fecha de fin es requerida");
    }

    if (promocion.fecha_inicio && promocion.fecha_fin) {
      const fechaInicio = new Date(promocion.fecha_inicio);
      const fechaFin = new Date(promocion.fecha_fin);
      if (fechaInicio >= fechaFin) {
        errores.push("La fecha de fin debe ser posterior a la fecha de inicio");
      }
    }

    if (!promocion.monto || parseFloat(promocion.monto.toString()) <= 0) {
      errores.push("El monto debe ser mayor a 0");
    }

    return {
      valido: errores.length === 0,
      errores,
    };
  }

  validarProductoPromocion(productoPromocion: Partial<ProductoPromocion>): {
    valido: boolean;
    errores: string[];
  } {
    const errores: string[] = [];

    if (!productoPromocion.producto_id) {
      errores.push("El producto es requerido");
    }

    if (!productoPromocion.promocion_id) {
      errores.push("La promoción es requerida");
    }

    return {
      valido: errores.length === 0,
      errores,
    };
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString("es-ES");
  }

  formatearMoneda(monto: number): string {
    return new Intl.NumberFormat("es-BO", {
      style: "currency",
      currency: "BOB",
    }).format(monto);
  }

  formatearPorcentaje(monto: number): string {
    return `${monto}%`;
  }

  esPromocionActiva(promocion: Promocion): boolean {
    if (!promocion.estado) return false;

    const hoy = new Date();
    const fechaInicio = new Date(promocion.fecha_inicio);
    const fechaFin = new Date(promocion.fecha_fin);

    return hoy >= fechaInicio && hoy <= fechaFin;
  }

  obtenerEstadoPromocion(promocion: Promocion): string {
    if (!promocion.estado) return "inactiva";

    const hoy = new Date();
    const fechaInicio = new Date(promocion.fecha_inicio);
    const fechaFin = new Date(promocion.fecha_fin);

    if (hoy < fechaInicio) return "pendiente";
    if (hoy > fechaFin) return "expirada";
    return "activa";
  }
}

export const servicioPromociones = new ServicioPromociones();
