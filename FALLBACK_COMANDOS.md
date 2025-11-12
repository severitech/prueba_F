# Sistema de Fallback Automático para Comandos

## 📋 Descripción

Se ha implementado un sistema inteligente de fallback que permite que los comandos de texto/audio se procesen **primero con IA (OpenAI)** y, si esta falla o no está disponible, **automáticamente reintente en modo local** (sin IA).

## 🎯 Características

### 1. **Flujo Automático**
```
Usuario envía comando
    ↓
Verificar disponibilidad de IA
    ↓
¿IA disponible? 
    ├─ SÍ → Intentar procesar con OpenAI
    │       ├─ ✓ Éxito → Retornar resultado
    │       └─ ✗ Falla → Fallback a modo local
    └─ NO → Procesar directamente en modo local
```

### 2. **Manejo de Errores**
- ✅ **Timeout**: Si OpenAI tarda más de 30 segundos (configurable)
- ✅ **Límite de cuota**: Si OpenAI reporta que se acabó el tiempo/créditos
- ✅ **Error de red**: Si hay problemas de conectividad
- ✅ **Audio sin IA**: Si se intenta procesar audio en modo local (retorna error amigable)

### 3. **Logging Detallado**
Cada paso se registra en la consola para debugging:
```
[Comandos] IA disponible: true, Intento local: false
[Comandos] Intentando con IA de OpenAI...
[Comandos] ✓ Procesado exitosamente con IA
```

## 🔧 Implementación

### Archivo Nuevo: `src/app/dashboard/reportes/utils/comandos.ts`

Contiene 2 funciones principales:

#### 1. `enviarComandoConFallback(comando, opciones)`
**Para texto**: Intenta con IA, fallback a local si falla.

```typescript
const resultado = await enviarComandoConFallback(
  "Quiero un reporte de ventas de septiembre",
  { timeout: 30000 } // Tiempo máximo en ms
);
```

**Opciones**:
- `intentoLocal`: bool (fuerza modo local, omite IA)
- `timeout`: number (tiempo máximo en ms, default 30000)

#### 2. `enviarAudioConFallback(audio, opciones)`
**Para audio**: Similar a texto, pero SIN fallback a local (audio requiere IA).

```typescript
const resultado = await enviarAudioConFallback(audioBlob, {
  timeout: 45000 // Más tiempo para procesar audio
});
```

## 📊 Casos de Uso

### Caso 1: IA Disponible y Funciona
```
enviarComandoConFallback("reporte de ventas")
  → status() devuelve ia_disponible: true
  → reportePorTexto(comando, true) → ✓ Éxito
  → Retorna resultado con IA
```

### Caso 2: IA Timeout
```
enviarComandoConFallback("reporte complejo", { timeout: 5000 })
  → status() devuelve ia_disponible: true
  → reportePorTexto() tarda > 5 segundos
  → Timeout → Fallback automático
  → reportePorTexto(comando, false) → ✓ Éxito en local
  → Retorna resultado sin IA (parsing local)
```

### Caso 3: IA No Disponible
```
enviarComandoConFallback("reporte")
  → status() devuelve ia_disponible: false
  → Salta directamente a modo local
  → reportePorTexto(comando, false) → ✓ Éxito
```

### Caso 4: Cuota OpenAI Agotada
```
enviarComandoConFallback("reporte")
  → status() devuelve ia_disponible: true (pero falla al usar)
  → reportePorTexto(comando, true) → Error "OpenAI"
  → Detecta error y fallback automático
  → reportePorTexto(comando, false) → ✓ Éxito en local
```

## 🔌 Integración en FiltroReportes.tsx

Se reemplazaron las llamadas directas:

**Antes:**
```typescript
const resultado = await servicioReportes.reportePorTexto(comandoTexto, true);
```

**Ahora:**
```typescript
const resultado = await enviarComandoConFallback(comandoTexto);
```

Similar para audio:
```typescript
const resultado = await enviarAudioConFallback(audioBits);
```

## 💡 Ventajas

1. **Transparente al usuario**: No necesita cambiar nada en la UI
2. **Robusto**: Maneja múltiples escenarios de falla
3. **Configurable**: Puede ajustarse timeout y comportamiento
4. **Auditable**: Logs detallados para debugging
5. **Escalable**: Fácil de extender con otros fallbacks

## ⚠️ Limitaciones

- ❌ **Audio sin IA**: No hay fallback para audio (requiere IA obligatoriamente)
  - Si audio falla, retorna error amigable invitando a usar texto
- ❌ **Modo local limitado**: El parsing local es más básico que OpenAI
  - Soporta comandos simples: "ventas de septiembre", "productos > 50"
  - No maneja comandos muy complejos sin IA

## 🚀 Próximas Mejoras

1. **Caché de resultados**: Guardar resultados previos para reutilizar
2. **Reintentos exponenciales**: Múltiples intentos con espera progresiva
3. **Analytics**: Rastrear fallbacks para monitoreo
4. **Fallback a audio-a-texto local**: Transcripción básica sin IA (sí es posible)

## 📞 Contacto

Si encuentra bugs o tiene sugerencias, abra un issue.
