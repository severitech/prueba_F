// utils/comandos.ts
import { servicioReportes, RespuestaBasica, ResultadoReporte } from "@/api/reportes.service";

interface OpcionesComando {
  intentoLocal?: boolean;
  timeout?: number;
}

/**
 * Envía un comando de texto/audio con fallback automático a modo local
 * si la IA de OpenAI no está disponible o falla.
 * 
 * FLUJO DE EJECUCIÓN:
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * Usuario envía comando
 *        ↓
 *  status() → ¿IA disponible?
 *        ↓
 *   ┌────┴─────────────────────────┐
 *   ↓ SÍ                            ↓ NO
 *   Intentar con IA            Modo local directo
 *   reportePorTexto(cmd, true)  reportePorTexto(cmd, false)
 *        ↓
 *   ┌────┴──────────────────────────┐
 *   ↓ ✓ Éxito                       ↓ ✗ Falla (OpenAI/Timeout)
 *   Retornar resultado        FALLBACK AUTOMÁTICO
 *                             reportePorTexto(cmd, false)
 *                                    ↓
 *                             ┌──────┴──────┐
 *                             ↓ ✓ Éxito    ↓ ✗ Error
 *                        Retornar      Error final
 * 
 * ERRORES CAPTURADOS:
 * • "OpenAI" → Límite de cuota, API key inválida
 * • Timeout  → Tarda más de 30 segundos
 * • Red      → Problemas de conectividad
 * • Otros    → Cualquier error no controlado
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * EJEMPLO:
 * const resultado = await enviarComandoConFallback(
 *   "Quiero un reporte de ventas de septiembre, agrupado por producto",
 *   { timeout: 30000 }
 * );
 */
export async function enviarComandoConFallback(
  comando: string,
  opciones: OpcionesComando = {}
): Promise<RespuestaBasica<ResultadoReporte>> {
  const { intentoLocal = false, timeout = 30000 } = opciones;

  try {
    // Paso 1: Verificar estado de la IA
    const estado = await servicioReportes.status();
    const iaDisponible = estado?.ia_disponible ?? false;

    console.log(`[Comandos] IA disponible: ${iaDisponible}, Intento local: ${intentoLocal}`);

    // Si ya es intento local, solo enviar sin IA
    if (intentoLocal) {
      console.log("[Comandos] Enviando comando en modo local (sin IA)...");
      return await servicioReportes.reportePorTexto(comando, false);
    }

    // Paso 2: Intentar con IA si está disponible
    if (iaDisponible) {
      console.log("[Comandos] Intentando con IA de OpenAI...");
      
      // Aplicar timeout para evitar esperar eternamente
      const promesa = servicioReportes.reportePorTexto(comando, true);
      const promesaTimeout = new Promise<RespuestaBasica<ResultadoReporte>>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout en procesamiento IA")), timeout)
      );

      try {
        const resultado = await Promise.race([promesa, promesaTimeout]);
        
        if (resultado.success) {
          console.log("[Comandos] ✓ Procesado exitosamente con IA");
          return resultado;
        } else if (resultado.error?.includes("OpenAI")) {
          throw new Error("Error de OpenAI - iniciando fallback");
        } else {
          return resultado;
        }
      } catch (errIA) {
        console.warn("⚠️ Error con IA:", errIA instanceof Error ? errIA.message : errIA);
        console.log("[Comandos] Reintentando en modo local...");
        
        // Fallback automático a modo local
        return await enviarComandoConFallback(comando, { 
          ...opciones, 
          intentoLocal: true 
        });
      }
    }

    // Paso 3: Si IA no está disponible, usar modo local directamente
    console.log("[Comandos] IA no disponible, usando modo local");
    return await servicioReportes.reportePorTexto(comando, false);

  } catch (err) {
    const mensajeError = err instanceof Error ? err.message : "Error desconocido";
    console.error("[Comandos] Error fatal:", mensajeError);
    
    return {
      success: false,
      error: `Error al procesar comando: ${mensajeError}`,
    };
  }
}

/**
 * Versión para audio con el mismo flujo de fallback
 * 
 * NOTA: Audio NO tiene fallback a modo local
 * Si OpenAI falla con audio, se retorna error (no hay parser de voz local)
 * 
 * FLUJO:
 * Usuario sube audio
 *        ↓
 *  status() → ¿IA disponible?
 *        ↓
 *   ┌────┴──────────────────────────────┐
 *   ↓ SÍ                                 ↓ NO
 *   Intentar procesar audio        Error: IA requerida
 *   reportePorAudio(audio)         Sugerir texto
 *        ↓
 *   ┌────┴────────────────────────┐
 *   ↓ ✓ Éxito                    ↓ ✗ Error
 *   Retornar resultado        Error: Sin fallback
 */
export async function enviarAudioConFallback(
  audio: Blob | File,
  opciones: OpcionesComando = {}
): Promise<RespuestaBasica<ResultadoReporte>> {
  const { intentoLocal = false, timeout = 30000 } = opciones;

  try {
    // Paso 1: Verificar estado de la IA
    const estado = await servicioReportes.status();
    const iaDisponible = estado?.ia_disponible ?? false;

    console.log(`[Comandos] IA disponible: ${iaDisponible}, Intento local: ${intentoLocal}`);

    // Si es intento local, no podemos procesar audio sin IA
    if (intentoLocal) {
      return {
        success: false,
        error: "No se puede procesar audio sin IA. Intenta con texto en su lugar.",
      };
    }

    // Paso 2: Intentar con IA si está disponible
    if (iaDisponible) {
      console.log("[Comandos] Intentando procesar audio con IA...");
      
      const promesa = servicioReportes.reportePorAudio(audio, "reporte.webm");
      const promesaTimeout = new Promise<RespuestaBasica<ResultadoReporte>>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout en procesamiento de audio")), timeout)
      );

      try {
        const resultado = await Promise.race([promesa, promesaTimeout]);
        
        if (resultado.success) {
          console.log("[Comandos] ✓ Audio procesado exitosamente con IA");
          return resultado;
        } else if (resultado.error?.includes("OpenAI")) {
          throw new Error("Error de OpenAI - no hay fallback para audio");
        } else {
          return resultado;
        }
      } catch (errIA) {
        console.warn("⚠️ Error procesando audio:", errIA instanceof Error ? errIA.message : errIA);
        
        return {
          success: false,
          error: "No se pudo procesar el audio. La IA de OpenAI no está disponible. Intenta con texto.",
        };
      }
    }

    // IA no disponible para audio
    return {
      success: false,
      error: "La IA no está disponible para procesar audio. Intenta con texto en su lugar.",
    };

  } catch (err) {
    const mensajeError = err instanceof Error ? err.message : "Error desconocido";
    console.error("[Comandos] Error fatal en audio:", mensajeError);
    
    return {
      success: false,
      error: `Error al procesar audio: ${mensajeError}`,
    };
  }
}
