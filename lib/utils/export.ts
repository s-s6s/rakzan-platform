export function exportCSV<T extends object>(data: T[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0] as object);
  const csv = [headers.join(','), ...data.map(row => headers.map(h => {
    const val = (row as Record<string, unknown>)[h];
    const str = val == null ? '' : String(val);
    return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str.replace(/"/g, '""')}"` : str;
  }).join(','))].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${filename}.csv`; a.click();
  URL.revokeObjectURL(url);
}
