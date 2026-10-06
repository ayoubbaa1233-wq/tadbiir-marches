/**
 * Utilitaires d'export Excel (CSV UTF-8 BOM) et d'impression
 */

export function exportToCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  // \uFEFF garantit la reconnaissance de l'UTF-8 par Microsoft Excel
  const bom = '\uFEFF';
  
  const escapeCell = (cell: string | number | undefined | null): string => {
    if (cell === undefined || cell === null) return '""';
    const str = String(cell).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerLine = headers.map(escapeCell).join(';');
  const rowLines = rows.map((row) => row.map(escapeCell).join(';'));
  const csvContent = bom + [headerLine, ...rowLines].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function triggerPrint() {
  window.print();
}
