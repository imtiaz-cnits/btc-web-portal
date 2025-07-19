//.........................................................................
//........................Table All Function Start..........................
//.........................................................................
document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Element References ---
  const dayShortSelect = document.getElementById("day_short");
  const entriesBoxSelect = document.getElementById("entries_box");
  const tableSearchInput = document.getElementById("table-search");
  const tableBody = document.querySelector(".table tbody");
  const entriesInfo = document.querySelector(".entries");
  const paginationUl = document.querySelector(".pagination ul");
  const headerCheckbox = document.getElementById("checkbox-all-items");

  // --- Global State Variables ---
  const allOriginalTableRows = Array.from(tableBody.querySelectorAll("tr"));
  let currentlyFilteredRows = [];
  let currentPage = 1;
  let rowsPerPage = parseInt(entriesBoxSelect.value);

  // --- Utility Functions ---
  function parseDate(dateString) {
    const [day, monthStr, year] = dateString.split(".");
    const monthMap = {
      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11,
    };
    return new Date(year, monthMap[monthStr], day);
  }

  // --- Core Table Functionality ---
  function applyFilters() {
    const selectedPeriod = dayShortSelect.value;
    const searchQuery = tableSearchInput.value.toLowerCase();
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    currentlyFilteredRows = allOriginalTableRows.filter((row) => {
      const dateCell = row.querySelector("td:last-child");
      const rowDateString = dateCell ? dateCell.textContent : "";
      const rowDate = rowDateString ? parseDate(rowDateString) : null;
      if (rowDate) rowDate.setHours(0, 0, 0, 0);

      let dateMatches = true;
      if (selectedPeriod !== "Last 30 Day") {
        if (!rowDate) {
          dateMatches = false;
        } else if (selectedPeriod === "Last Day") {
          const yesterday = new Date(now);
          yesterday.setDate(now.getDate() - 1);
          dateMatches =
            rowDate.getTime() === now.getTime() ||
            rowDate.getTime() === yesterday.getTime();
        } else if (selectedPeriod === "Last 7 Day") {
          const sevenDaysAgo = new Date(now);
          sevenDaysAgo.setDate(now.getDate() - 7);
          dateMatches = rowDate >= sevenDaysAgo;
        } else if (selectedPeriod === "Last Month") {
          const lastMonthStart = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            1
          );
          const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          dateMatches = rowDate >= lastMonthStart && rowDate < thisMonthStart;
        } else if (selectedPeriod === "Last Year") {
          const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
          const thisYearStart = new Date(now.getFullYear(), 0, 1);
          dateMatches = rowDate >= lastYearStart && rowDate < thisYearStart;
        }
      }

      const rowText = row.textContent.toLowerCase();
      const searchMatches = rowText.includes(searchQuery);

      return dateMatches && searchMatches;
    });

    currentPage = 1;
    displayCurrentPageRows();
  }

  function displayCurrentPageRows() {
    tableBody.innerHTML = "";

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(
      startIndex + rowsPerPage,
      currentlyFilteredRows.length
    );

    const rowsToDisplay = currentlyFilteredRows.slice(startIndex, endIndex);

    if (
      rowsToDisplay.length === 0 &&
      currentlyFilteredRows.length > 0 &&
      currentPage > 1
    ) {
      currentPage = Math.ceil(currentlyFilteredRows.length / rowsPerPage);
      displayCurrentPageRows();
      return;
    }

    rowsToDisplay.forEach((row) => {
      tableBody.appendChild(row.cloneNode(true));
    });

    updateEntriesInfo();
    updatePaginationControls();
  }

  function updateEntriesInfo() {
    const totalFilteredRows = currentlyFilteredRows.length;
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentDisplayedCount = Math.min(
      rowsPerPage,
      totalFilteredRows - startIndex
    );

    if (totalFilteredRows === 0) {
      entriesInfo.textContent = `No matching entries found.`;
    } else {
      entriesInfo.textContent = `Showing ${currentDisplayedCount} of ${totalFilteredRows} entries`;
    }
  }

  function updatePaginationControls() {
    paginationUl.innerHTML = "";
    const totalPages = Math.ceil(currentlyFilteredRows.length / rowsPerPage);

    const prevLi = document.createElement("li");
    prevLi.className = `mx-1 px-3 py-2 bg-gray-200 rounded-lg ${
      currentPage === 1 || totalPages === 0
        ? "text-gray-500 opacity-50 cursor-not-allowed"
        : "text-[var(--text-1)] hover:bg-gray-700 hover:text-gray-200 cursor-pointer"
    }`;
    prevLi.innerHTML = `<a class="flex items-center font-bold" href="#"><span>previous</span></a>`;
    prevLi.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPage > 1) {
        currentPage--;
        displayCurrentPageRows();
      }
    });
    paginationUl.appendChild(prevLi);

    for (let i = 1; i <= totalPages; i++) {
      const pageLi = document.createElement("li");
      pageLi.className = `mx-1 px-3 py-2 bg-gray-200 rounded-lg ${
        i === currentPage
          ? "bg-gray-700 text-gray-200"
          : "text-[var(--text-1)] hover:bg-gray-700 hover:text-gray-200 cursor-pointer"
      }`;
      pageLi.innerHTML = `<a class="font-bold" href="#">${i}</a>`;
      pageLi.addEventListener("click", (e) => {
        e.preventDefault();
        currentPage = i;
        displayCurrentPageRows();
      });
      paginationUl.appendChild(pageLi);
    }

    const nextLi = document.createElement("li");
    nextLi.className = `mx-1 px-3 py-2 bg-gray-200 rounded-lg ${
      currentPage === totalPages || totalPages === 0
        ? "text-gray-500 opacity-50 cursor-not-allowed"
        : "text-[var(--text-1)] hover:bg-gray-700 hover:text-gray-200 cursor-pointer"
    }`;
    nextLi.innerHTML = `<a class="flex items-center font-bold" href="#"><span>Next</span></a>`;
    nextLi.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPage < totalPages) {
        currentPage++;
        displayCurrentPageRows();
      }
    });
    paginationUl.appendChild(nextLi);
  }

  // --- Event Listeners ---
  dayShortSelect.addEventListener("change", applyFilters);
  entriesBoxSelect.addEventListener("change", (e) => {
    rowsPerPage = parseInt(e.target.value);
    applyFilters();
  });
  tableSearchInput.addEventListener("keyup", applyFilters);

  // --- Initial Setup ---
  applyFilters();
});
//.........................................................................
//........................Table All Function End..........................
//.........................................................................

// .........................................................................
// ................Table Copy,Csv,Pdf,Print all file Start..................
// .........................................................................
document.addEventListener("DOMContentLoaded", function () {
  // Helper function to get clean table data (without checkboxes)
  function getTableData() {
    const data = [];
    const headers = [];
    const table = document.querySelector("table");

    // Get headers
    const headerCells = table.querySelectorAll("thead th");
    headerCells.forEach(function (th) {
      if (!th.classList.contains("skip-export")) {
        // Skip columns if needed
        headers.push(th.textContent.trim());
      }
    });
    data.push(headers);

    // Get rows
    const rows = table.querySelectorAll("tbody tr");
    rows.forEach(function (tr) {
      const row = [];
      const cells = tr.querySelectorAll("td");

      cells.forEach(function (td, index) {
        if (!td.classList.contains("skip-export")) {
          // Skip columns if needed
          // Skip checkbox cells (they're usually the first column)
          if (index === 0 && td.querySelector('input[type="checkbox"]')) {
            // Push the row number instead of checkbox
            const span = td.querySelector("span");
            row.push(span ? span.textContent.trim() : "");
          } else {
            row.push(td.textContent.trim());
          }
        }
      });

      if (row.length > 0) {
        data.push(row);
      }
    });

    return data;
  }

  // Copy table to clipboard
  document.getElementById("copyBtn").addEventListener("click", function () {
    const data = getTableData();
    let csvContent = "";

    data.forEach((row) => {
      csvContent += row.join("\t") + "\n";
    });

    navigator.clipboard
      .writeText(csvContent)
      .then(() => {
        alert("Table copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = csvContent;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        alert("Table copied to clipboard!");
      });
  });

  // Export table to CSV
  document.getElementById("csvBtn").addEventListener("click", function () {
    const data = getTableData();
    let csvContent = "data:text/csv;charset=utf-8,";

    data.forEach((row) => {
      csvContent += row.join(",") + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "table_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Export table to PDF
  document.getElementById("pdfBtn").addEventListener("click", function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "pt");

    const data = getTableData();
    const headers = data[0];
    const rows = data.slice(1);

    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 20,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: "linebreak",
      },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { cellWidth: "auto" },
        // Add more column styles if needed
      },
    });

    doc.save("table_data.pdf");
  });

  // Print table
  document.getElementById("printBtn").addEventListener("click", function () {
    // Create a new tab instead of a new window
    const printContent = `
        <html>
            <head>
                <title>Table Print</title>
                <style>
                    /* Basic table styling */
                    table {
                        border-collapse: collapse;
                        width: 100%;
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                    }
                    th {
                        background-color: #f2f2f2;
                    }

                    /* --- Print Specific Styles --- */
                    @page {
                        size: A4;
                        margin: 10px;
                    }

                    h2 {
                        text-align: center;
                    }

                    @media print {
                        #printBtn {
                            display: none;
                        }

                        .hide_content {
                            display: none;
                        }

                        body {
                            -webkit-print-color-adjust: exact;
                            color-adjust: exact;
                        }
                    }
                </style>
            </head>
            <body>
                <h2>Table Data</h2>
                ${
                  document.querySelector("table")?.outerHTML ||
                  "<p>No table found to print.</p>"
                }
            </body>
        </html>
    `;

    // Open in a new tab
    const printTab = window.open();
    printTab.document.open();
    printTab.document.write(printContent);
    printTab.document.close();

    // Give a small delay for the content to render before printing
    setTimeout(() => {
      printTab.print();
      // Optional: close the tab after printing
      // printTab.close();
    }, 500);
  });
});
// .........................................................................
// ................Table Copy,Csv,Pdf,Print all file End..................
// .........................................................................
