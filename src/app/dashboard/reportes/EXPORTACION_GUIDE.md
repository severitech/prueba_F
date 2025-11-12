# 📥 Sistema de Exportación - Módulo Reportes

## Descripción General

Se ha implementado un sistema completo de exportación de reportes en múltiples formatos (JSON, Excel, PDF) tanto para datos estáticos como para resultados dinámicos procesados por voz.

## 📁 Archivos Creados/Modificados

### Nuevos Archivos:

1. **`src/app/dashboard/reportes/utils/exportar.ts`**
   - Funciones reutilizables para exportación
   - Soporte para JSON, Excel y PDF
   - Manejo de KPIs separado

### Archivos Modificados:

1. **`src/app/dashboard/reportes/components/Acciones.tsx`**
   - Integración de funciones de exportación
   - Dropdown mejorado con separadores
   - Opciones separadas para Datos y KPIs

2. **`src/app/dashboard/reportes/page.tsx`**
   - Eliminada función `descargarReporte` redundante
   - Paso de `resultado` al componente Acciones

## 🔧 Funciones de Exportación

### 1. JSON Export
```typescript
exportarJSON(datos: any[], options: ExportOptions)
```
- Exporta datos como JSON formateado
- Incluye indentación de 2 espacios
- Archivo: `reporte_[tipo]_[timestamp].json`

### 2. Excel Export
```typescript
exportarExcel(datos: any[], options: ExportOptions)
exportarKPIsExcel(kpis: Record<string, any>, options: ExportOptions)
```
- Crea hojas de cálculo con XLSX
- Ajusta automáticamente ancho de columnas
- Soporta múltiples hojas
- Archivo: `reporte_[tipo]_[timestamp].xlsx`

### 3. PDF Export
```typescript
exportarPDF(datos: any[], options: ExportOptions)
exportarKPIsPDF(kpis: Record<string, any>, options: ExportOptions)
```
- Genera PDFs con tablas formateadas
- Estilos profesionales con colores
- Incluye títulos y fechas
- Encabezados destacados en azul
- Filas alternadas para mejor legibilidad
- Archivo: `reporte_[tipo]_[timestamp].pdf`

## 🎯 Casos de Uso

### Filtros Estáticos
1. Selecciona tipo de reporte (Ventas, Productos, Clientes, Inventario)
2. Aplica filtros específicos
3. Click en botón **"Generar"**
4. Click en dropdown **"Descargar"** → elige formato

**Opciones disponibles:**
- Datos → JSON / Excel / PDF
- KPIs → JSON / Excel / PDF (si aplica)

### Filtros Dinámicos por Voz

#### Comando de Texto
1. En tab "Comando Texto", escribe tu comando
   - Ejemplo: "Mostrame las ventas de marzo"
   - Ejemplo: "Productos con stock bajo"
2. Click **"Procesar Comando"**
3. La IA procesa y genera reporte automáticamente
4. Descarga disponible en dropdown

#### Comando de Voz
1. En tab "Comando Voz", click **"Iniciar Grabación"**
2. Habla tu comando (máximo 30 segundos)
3. Click **"Detener Grabación"**
4. Click **"Procesar Audio"**
5. Sistema transcribe y procesa
6. Descarga disponible en dropdown

## 📊 Formato de Exportación

### Excel
| Campo | Formato |
|-------|---------|
| Números | 2 decimales, separador regional (es-CO) |
| Fechas | Formato local |
| Booleanos | Sí/No |
| Ancho columnas | Auto-ajustado |

### PDF
| Elemento | Estilo |
|----------|--------|
| Título | 16pt, negrita |
| Encabezados tabla | Fondo azul (#345B6E), texto blanco |
| Filas alternas | Gris claro (#F5F5F5) |
| Números | 2 decimales, formato local |
| Página | A4, márgenes 10mm |

### JSON
- Indentación: 2 espacios
- Encoding: UTF-8
- Estructura: Array de objetos

## 🔌 Dependencias Instaladas

```bash
npm install xlsx jspdf jspdf-autotable
```

- **xlsx**: Para generar archivos Excel
- **jspdf**: Motor de generación de PDF
- **jspdf-autotable**: Plugin para tablas en PDF

## 💾 Estructura de Nombres de Archivo

```
reporte_[tipoReporte]_[timestamp].{ext}
```

**Ejemplos:**
- `reporte_ventas_1731449064000.xlsx`
- `reporte_productos_1731449064000.pdf`
- `reporte_clientes_1731449064001_kpis.json`

## 🎨 Interfaz del Dropdown "Descargar"

```
Descargar ↓
├── Datos
│   ├── JSON
│   ├── Excel
│   └── PDF
├── ─────────────── (separador)
└── KPIs (si existen)
    ├── JSON KPIs
    ├── Excel KPIs
    └── PDF KPIs
```

## ✨ Características Especiales

### Para Datos Grandes
- Excel: Maneja miles de registros eficientemente
- PDF: Divide en múltiples páginas automáticamente
- JSON: Sin límite de tamaño (navegador dependiente)

### Localización
- Números con separador decimal español
- Fechas en formato local (es-CO)
- Nombres de campos sin guiones bajos

### Profesionalismo
- Logos/estilos corporativos en PDF
- Tablas formateadas con colores
- Información de generación incluida

## 🐛 Manejo de Errores

Cada función incluye:
- Try-catch blocks
- Console logging para debugging
- Mensaje al usuario en caso de error
- Validación de datos antes de exportar

## 📝 Ejemplos de Código

### Exportar Datos
```typescript
import { exportarExcel } from '@/app/dashboard/reportes/utils/exportar';

exportarExcel(resultados, {
  filename: 'ventas_reporte',
  sheetName: 'Ventas'
});
```

### Exportar KPIs
```typescript
import { exportarKPIsPDF } from '@/app/dashboard/reportes/utils/exportar';

exportarKPIsPDF(kpis, {
  filename: 'kpis_reporte',
  title: 'Indicadores Clave de Desempeño'
});
```

## 🚀 Próximas Mejoras Posibles

1. Plantillas personalizables para PDF
2. Incluir gráficos en PDF
3. Exportación a CSV
4. Email directo del reporte
5. Almacenamiento en cloud
6. Historial de descargas

---

**Versión:** 1.0  
**Última actualización:** 12 de noviembre de 2025  
**Estado:** ✅ Funcional
