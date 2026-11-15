export function downloadCsv(
  filename: string,
  header: string[],
  rows: (string | number)[][],
) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const text = [header, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");

  const url = URL.createObjectURL(
    new Blob(["\uFEFF" + text], { type: "text/csv;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}