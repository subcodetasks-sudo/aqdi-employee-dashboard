import * as XLSX from "xlsx";

/** Writes `rows` (array of plain objects) to a downloaded .xlsx file, date-stamped. */
export function writeExcelFile(rows, { filename = "export", sheetName = "Sheet1" } = {}) {
  if (!rows?.length) return false;

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const dateStamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `${filename}-${dateStamp}.xlsx`);
  return true;
}
