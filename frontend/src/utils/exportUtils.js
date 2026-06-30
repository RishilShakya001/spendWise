// Simple client-side export to "Excel" (actually CSV) without extra libraries.
// Used by Income and Expense pages.

export const exportToExcel = (rows, filename = "data_export") => {
  try {
    if (!Array.isArray(rows) || rows.length === 0) {
      alert("No data available to export.");
      return;
    }

    const safeFilename = `${filename.replace(/[^a-z0-9_-]/gi, "_")}.csv`;

    const headers = Object.keys(rows[0]);
    const csvLines = [
      headers.join(","), // header row
      ...rows.map((row) =>
        headers
          .map((key) => {
            const value = row[key] ?? "";
            const str = String(value).replace(/"/g, '""');
            return /[",\n]/.test(str) ? `"${str}"` : str;
          })
          .join(","),
      ),
    ];

    const blob = new Blob([csvLines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = safeFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("exportToExcel failed", err);
    alert("Failed to export data.");
  }
};

