const ExcelJS = require("exceljs");

// Returns the first sheet's rows (header row excluded) as arrays of strings.
const readRows = async (filePath) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];
  if (!sheet) return [];
  const rows = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const cells = [];
    for (let col = 1; col <= row.cellCount; col++) {
      const value = row.getCell(col).value;
      if (value instanceof Date) cells.push(value.toISOString().slice(0, 10));
      else if (value && typeof value === "object" && "text" in value) cells.push(String(value.text).trim());
      else cells.push(value == null ? "" : String(value).trim());
    }
    rows.push(cells);
  });
  return rows;
};

module.exports = { readRows };
