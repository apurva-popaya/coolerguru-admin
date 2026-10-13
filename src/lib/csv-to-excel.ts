/*
 * Parses CSV text (RFC 4180): quoted fields, escaped quotes ("")
 * and commas or line breaks inside quoted values.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  // Strip the UTF-8 BOM that many CSV exports start with.
  const input = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;

  for (let index = 0; index < input.length; index++) {
    const char = input[index];

    if (inQuotes) {
      if (char === '"') {
        if (input[index + 1] === '"') {
          field += '"';
          index++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }

      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && input[index + 1] === "\n") {
        index++;
      }

      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

/*
 * Plain numbers (quantities, counts) become numeric cells. Long digit
 * strings such as phone numbers and values with leading zeros stay text
 * so Excel does not mangle them.
 */
function toCellValue(value: string): string | number {
  if (/^-?(0|[1-9]\d{0,8})(\.\d+)?$/.test(value)) {
    return Number(value);
  }

  return value;
}

/* Converts CSV text into an .xlsx file with a styled header row. */
export async function csvToExcelBlob(csv: string, sheetName = "Sheet1"): Promise<Blob> {
  const { default: ExcelJS } = await import("exceljs");

  const rows = parseCsv(csv);
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName, {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  rows.forEach((row, rowIndex) => {
    worksheet.addRow(rowIndex === 0 ? row : row.map(toCellValue));
  });

  if (rows.length > 0) {
    const header = worksheet.getRow(1);

    header.font = { bold: true };
    header.alignment = { vertical: "middle" };
    header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEDEBFB" } };

    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: rows[0].length },
    };
  }

  worksheet.columns.forEach((column, columnIndex) => {
    const longest = rows.reduce((max, row) => Math.max(max, (row[columnIndex] ?? "").length), 0);

    column.width = Math.min(Math.max(longest + 2, 10), 60);
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

/* Reads the filename from a Content-Disposition header, if the server sent one. */
export function getFilenameFromDisposition(disposition: string | null): string | null {
  if (!disposition) {
    return null;
  }

  const encodedMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);

  if (encodedMatch?.[1]) {
    return decodeURIComponent(encodedMatch[1].trim());
  }

  const match = disposition.match(/filename="?([^";]+)"?/i);

  return match?.[1]?.trim() || null;
}
