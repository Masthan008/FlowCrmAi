import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useSettingsStore } from '../store/settingsStore';

/**
 * Helper to yield the main UI thread so loading spinners and toasts render without lag
 */
const yieldMainThread = (): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, 50));
};

/**
 * Optimized Non-Blocking CSV Export with UTF-8 BOM for Excel Compatibility
 */
export async function exportToCSV(data: Record<string, any>[], filename: string) {
  if (!data || !data.length) return;

  // Yield UI thread to keep website smooth
  await yieldMainThread();

  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((h) => {
      const val = row[h];
      if (val === null || val === undefined) return '""';
      const str = String(val);
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : `"${str}"`;
    })
  );

  // Add UTF-8 BOM byte order mark \uFEFF so Microsoft Excel opens special chars cleanly
  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `${filename}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/**
 * Non-Blocking Enterprise DOM Snapshot PDF Export
 */
export async function exportToPDF(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  // Yield UI thread to prevent lag
  await yieldMainThread();

  const canvas = await html2canvas(element, {
    scale: 1.5,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  await yieldMainThread();

  const imgData = canvas.toDataURL('image/jpeg', 0.92);
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  let heightLeft = pdfHeight;
  let position = 0;
  const pageHeight = pdf.internal.pageSize.getHeight();

  pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - pdfHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  pdf.save(`${filename}_${dateStr}.pdf`);
}

/**
 * Enterprise Styled Vector PDF Report Template Generator (Ultra Fast & Crisp)
 */
export async function exportReportToPDF(options: {
  title: string;
  subtitle?: string;
  companyName?: string;
  kpis?: { label: string; value: string | number }[];
  columns: { header: string; key: string }[];
  data: Record<string, any>[];
  filename: string;
}) {
  await yieldMainThread();

  const { title, subtitle, kpis = [], columns, data, filename } = options;
  const companyName = options.companyName || useSettingsStore.getState().settings.companyName || 'FlowCRM AI Enterprise';

  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = margin;

  // 1. Header Banner
  doc.setFillColor(13, 148, 136); // Teal Primary Accent
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Title Text inside Banner
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(companyName.toUpperCase(), margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`EXECUTIVE REPORT • ${new Date().toLocaleDateString('en-US')}`, pageWidth - margin - 50, 12);

  y = 32;

  // 2. Report Subheading
  doc.setTextColor(15, 23, 42); // Dark slate
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(title, margin, y);
  y += 6;

  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(subtitle, margin, y);
    y += 8;
  } else {
    y += 4;
  }

  // 3. KPI Summary Metric Boxes (If provided)
  if (kpis.length > 0) {
    const boxWidth = (pageWidth - margin * 2 - (kpis.length - 1) * 4) / Math.min(kpis.length, 4);
    const boxHeight = 16;

    kpis.slice(0, 4).forEach((kpi, idx) => {
      const boxX = margin + idx * (boxWidth + 4);
      doc.setFillColor(248, 250, 252); // Soft slate background
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(boxX, y, boxWidth, boxHeight, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(kpi.label.toUpperCase(), boxX + 4, y + 5);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(String(kpi.value), boxX + 4, y + 12);
    });

    y += boxHeight + 10;
  }

  // 4. Data Table Rendering
  const colWidth = (pageWidth - margin * 2) / columns.length;
  const rowHeight = 8;

  // Table Header
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(margin, y, pageWidth - margin * 2, rowHeight, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);

  columns.forEach((col, idx) => {
    doc.text(col.header.toUpperCase(), margin + idx * colWidth + 3, y + 5.5);
  });

  y += rowHeight;

  // Table Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  data.forEach((row, rowIdx) => {
    // Page overflow check
    if (y + rowHeight > pageHeight - 15) {
      doc.addPage();
      y = margin + 10;
      // Re-draw Table Header on new page
      doc.setFillColor(30, 41, 59);
      doc.rect(margin, y, pageWidth - margin * 2, rowHeight, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      columns.forEach((col, idx) => {
        doc.text(col.header.toUpperCase(), margin + idx * colWidth + 3, y + 5.5);
      });
      y += rowHeight;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
    }

    // Alternating Row Background
    if (rowIdx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, pageWidth - margin * 2, rowHeight, 'F');
    }

    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);

    doc.setTextColor(51, 65, 85);
    columns.forEach((col, colIdx) => {
      const cellVal = row[col.key] !== undefined && row[col.key] !== null ? String(row[col.key]) : '-';
      doc.text(cellVal.substring(0, 28), margin + colIdx * colWidth + 3, y + 5.5);
    });

    y += rowHeight;
  });

  // Footer Page Numbers
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${totalPages} • Generated by ${companyName}`, margin, pageHeight - 6);
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`${filename}_${dateStr}.pdf`);
}
