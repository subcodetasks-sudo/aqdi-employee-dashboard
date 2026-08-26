/** Prints only the report panel matching `panelId` (see `.reports-printing` rule in globals.css).
 *  "Save as PDF" in the browser's print dialog covers the PDF case without a client-side PDF library. */
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
