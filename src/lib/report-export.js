/** Downloads the report panel as a PDF file (client-side render via html2canvas + jsPDF). */
export async function downloadReportPdf(
  panelId = "reports-print-area",
  filenamePrefix = "report"
) {
  const panel = document.getElementById(panelId);
  if (!panel) return false;

  document.body.classList.add("reports-printing");

  try {
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);

    const canvas = await html2canvas(panel, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#F4F6F5",
      windowWidth: panel.scrollWidth,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.pdf`);
    return true;
  } catch {
    return false;
  } finally {
    document.body.classList.remove("reports-printing");
  }
}

/** Prints only the report panel matching `panelId` (see `.reports-printing` rule in globals.css). */
export function printReportPanel(panelId = "reports-print-area") {
  const panel = document.getElementById(panelId);
  if (!panel) return false;

  document.body.classList.add("reports-printing");
  const cleanup = () => document.body.classList.remove("reports-printing");
  window.addEventListener("afterprint", cleanup, { once: true });
  window.print();
  setTimeout(cleanup, 3000);
  return true;
}

function csvCell(text) {
  return `"${String(text ?? "").replace(/"/g, '""').trim()}"`;
}

/** Scrapes every <table> inside the report panel into a CSV. Returns false if the
 *  active report has no tabular data (KPI/chart-only tabs). */
export function exportPanelTablesToCsv(panelId = "reports-print-area", filenamePrefix = "report") {
  const panel = document.getElementById(panelId);
  if (!panel) return false;

  const tables = Array.from(panel.querySelectorAll("table"));
  if (tables.length === 0) return false;

  const blocks = tables.map((table) =>
    Array.from(table.querySelectorAll("tr"))
      .map((row) =>
        Array.from(row.querySelectorAll("th,td"))
          .map((cell) => csvCell(cell.textContent))
          .join(",")
      )
      .join("\n")
  );

  const csv = `﻿${blocks.join("\n\n")}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  return true;
}
