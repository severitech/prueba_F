import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface ExportOptions {
  filename: string;
  sheetName?: string;
  title?: string;
}

/**
 * Exportar datos a Excel con estilos
 */
export const exportarExcel = (
  datos: any[],
  options: ExportOptions
) => {
  try {
    const { filename, sheetName = "Datos", title = "Reporte" } = options;

    // Crear workbook
    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Configurar anchos de columnas
    const columnKeys = Object.keys(datos[0] || {});
    const colWidths = columnKeys.map(key => {
      const maxLength = Math.max(
        key.length,
        Math.max(...datos.map(row => String(row[key] || '').length))
      );
      return { wch: Math.min(maxLength + 2, 30) };
    });
    ws['!cols'] = colWidths;

    // Aplicar estilos a los encabezados (fila 1)
    const headerFill = { patternType: 'solid', fgColor: { rgb: 'FF345B6E' } }; // Azul oscuro
    const headerFont = { bold: true, color: { rgb: 'FFFFFFFF' }, size: 11 }; // Blanco
    const headerAlignment = { horizontal: 'center', vertical: 'center' };
    const headerBorder = {
      left: { style: 'thin', color: { rgb: 'FF000000' } },
      right: { style: 'thin', color: { rgb: 'FF000000' } },
      top: { style: 'thin', color: { rgb: 'FF000000' } },
      bottom: { style: 'thin', color: { rgb: 'FF000000' } },
    };

    // Aplicar estilos a las filas de datos
    const dataCellFill = (rowIndex: number) => 
      rowIndex % 2 === 0 
        ? { patternType: 'solid', fgColor: { rgb: 'FFF5F5F5' } } // Gris claro alterno
        : { patternType: 'solid', fgColor: { rgb: 'FFFFFFFF' } }; // Blanco
    
    const dataCellFont = { size: 10 };
    const dataCellAlignment = { horizontal: 'left', vertical: 'center', wrapText: true };
    const dataCellBorder = {
      left: { style: 'thin', color: { rgb: 'FFCCCCCC' } },
      right: { style: 'thin', color: { rgb: 'FFCCCCCC' } },
      top: { style: 'thin', color: { rgb: 'FFCCCCCC' } },
      bottom: { style: 'thin', color: { rgb: 'FFCCCCCC' } },
    };

    // Aplicar estilos
    for (let rowIndex = 0; rowIndex < datos.length + 1; rowIndex++) {
      for (let colIndex = 0; colIndex < columnKeys.length; colIndex++) {
        const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
        
        if (!ws[cellRef]) continue;

        if (rowIndex === 0) {
          // Encabezado
          ws[cellRef].fill = headerFill as any;
          ws[cellRef].font = headerFont as any;
          ws[cellRef].alignment = headerAlignment;
          ws[cellRef].border = headerBorder as any;
        } else {
          // Datos
          ws[cellRef].fill = dataCellFill(rowIndex - 1) as any;
          ws[cellRef].font = dataCellFont as any;
          ws[cellRef].alignment = dataCellAlignment;
          ws[cellRef].border = dataCellBorder as any;
          
          // Formato de números
          const value = ws[cellRef].v;
          if (typeof value === 'number') {
            ws[cellRef].z = '#,##0.00'; // Formato con 2 decimales
          }
        }
      }
    }

    // Congelar encabezado
    ws['!freeze'] = { xSplit: 0, ySplit: 1 };

    // Descargar
    XLSX.writeFile(wb, `${filename}.xlsx`);
    console.log('[Exportar] Excel descargado:', filename);
    return true;
  } catch (err) {
    console.error('[Exportar] Error Excel:', err);
    return false;
  }
};

/**
 * Exportar datos a PDF con tabla
 */
export const exportarPDF = (
  datos: any[],
  options: ExportOptions
) => {
  try {
    const { filename, title = "Reporte" } = options;

    const pdf = new jsPDF();
    
    // Agregar título
    pdf.setFontSize(16);
    pdf.text(title, 14, 22);

    // Agregar metadata
    pdf.setFontSize(10);
    pdf.text(`Generado: ${new Date().toLocaleString('es-CO')}`, 14, 30);

    // Preparar columnas para tabla
    const columnKeys = Object.keys(datos[0] || {});
    const columnHeaders = columnKeys.map(k => k.replace(/_/g, ' ').toUpperCase());
    
    // Preparar datos de tabla
    const tableData = datos.map(row =>
      columnKeys.map(key => {
        const value = row[key];
        if (typeof value === 'number') {
          return value.toLocaleString('es-CO', { maximumFractionDigits: 2 });
        }
        return String(value || '');
      })
    );

    // Agregar tabla
    autoTable(pdf, {
      head: [columnHeaders],
      body: tableData,
      startY: 38,
      margin: { left: 10, right: 10 },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [52, 73, 94],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    // Descargar
    pdf.save(`${filename}.pdf`);
    console.log('[Exportar] PDF descargado:', filename);
    return true;
  } catch (err) {
    console.error('[Exportar] Error PDF:', err);
    return false;
  }
};

/**
 * Exportar JSON
 */
export const exportarJSON = (
  datos: any[],
  options: ExportOptions
) => {
  try {
    const { filename } = options;

    const json = JSON.stringify(datos, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    a.click();
    URL.revokeObjectURL(url);

    console.log('[Exportar] JSON descargado:', filename);
    return true;
  } catch (err) {
    console.error('[Exportar] Error JSON:', err);
    return false;
  }
};

/**
 * Exportar KPIs como tabla
 */
export const exportarKPIsPDF = (
  kpis: Record<string, any>,
  options: ExportOptions
) => {
  try {
    const { filename, title = "KPIs" } = options;

    const pdf = new jsPDF();

    // Agregar título
    pdf.setFontSize(16);
    pdf.text(title, 14, 22);

    // Agregar metadata
    pdf.setFontSize(10);
    pdf.text(`Generado: ${new Date().toLocaleString('es-CO')}`, 14, 30);

    // Preparar datos de KPIs
    const kpiData = Object.entries(kpis).map(([key, value]) => [
      key.replace(/_/g, ' ').toUpperCase(),
      typeof value === 'number'
        ? value.toLocaleString('es-CO', { maximumFractionDigits: 2 })
        : String(value),
    ]);

    // Agregar tabla
    autoTable(pdf, {
      head: [['KPI', 'Valor']],
      body: kpiData,
      startY: 38,
      margin: { left: 10, right: 10 },
      styles: {
        fontSize: 11,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    pdf.save(`${filename}.pdf`);
    console.log('[Exportar] KPIs PDF descargado:', filename);
    return true;
  } catch (err) {
    console.error('[Exportar] Error KPIs PDF:', err);
    return false;
  }
};

/**
 * Exportar KPIs a Excel
 */
export const exportarKPIsExcel = (
  kpis: Record<string, any>,
  options: ExportOptions
) => {
  try {
    const { filename, sheetName = "KPIs" } = options;

    const kpiData = Object.entries(kpis).map(([key, value]) => ({
      KPI: key.replace(/_/g, ' ').toUpperCase(),
      Valor: value,
    }));

    const ws = XLSX.utils.json_to_sheet(kpiData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Estilos para encabezados
    const headerFill = { patternType: 'solid', fgColor: { rgb: 'FF345B6E' } };
    const headerFont = { bold: true, color: { rgb: 'FFFFFFFF' }, size: 12 };
    const headerAlignment = { horizontal: 'center', vertical: 'center', wrapText: true };
    const headerBorder = {
      top: { style: 'thin', color: { rgb: 'FF000000' } },
      bottom: { style: 'thin', color: { rgb: 'FF000000' } },
      left: { style: 'thin', color: { rgb: 'FF000000' } },
      right: { style: 'thin', color: { rgb: 'FF000000' } },
    };

    // Aplicar estilos al encabezado
    const headers = ['A1', 'B1'];
    headers.forEach(cell => {
      if (ws[cell]) {
        ws[cell].fill = headerFill;
        ws[cell].font = headerFont;
        ws[cell].alignment = headerAlignment;
        ws[cell].border = headerBorder;
      }
    });

    // Estilos para datos
    const dataBorder = {
      top: { style: 'thin', color: { rgb: 'FFD3D3D3' } },
      bottom: { style: 'thin', color: { rgb: 'FFD3D3D3' } },
      left: { style: 'thin', color: { rgb: 'FFD3D3D3' } },
      right: { style: 'thin', color: { rgb: 'FFD3D3D3' } },
    };
    const dataAlignment = { horizontal: 'left', vertical: 'center', wrapText: true };
    const numberAlignment = { horizontal: 'right', vertical: 'center', wrapText: true };

    // Aplicar estilos a los datos
    for (let i = 2; i <= kpiData.length + 1; i++) {
      const isEven = (i - 2) % 2 === 0;
      const dataFill = isEven
        ? { patternType: 'solid', fgColor: { rgb: 'FFF5F5F5' } }
        : { patternType: 'solid', fgColor: { rgb: 'FFFFFFFF' } };

      // Celda A (KPI)
      const cellA = `A${i}`;
      if (ws[cellA]) {
        ws[cellA].fill = dataFill;
        ws[cellA].border = dataBorder;
        ws[cellA].alignment = dataAlignment;
      }

      // Celda B (Valor)
      const cellB = `B${i}`;
      if (ws[cellB]) {
        ws[cellB].fill = dataFill;
        ws[cellB].border = dataBorder;
        ws[cellB].alignment = numberAlignment;

        // Formatear números si es necesario
        if (typeof ws[cellB].v === 'number') {
          ws[cellB].z = '#,##0.00';
        }
      }
    }

    // Ancho de columnas y congelar encabezado
    ws['!cols'] = [{ wch: 35 }, { wch: 25 }];
    ws['!freeze'] = { xSplit: 0, ySplit: 1 };

    XLSX.writeFile(wb, `${filename}.xlsx`);
    console.log('[Exportar] KPIs Excel descargado:', filename);
    return true;
  } catch (err) {
    console.error('[Exportar] Error KPIs Excel:', err);
    return false;
  }
};

