// ===============================
// 💰 Smart Expense Tracker – app.js
// ===============================

// Replace this with your Apps Script Web App URL
const API_URL = "https://script.google.com/macros/s/AKfycbxJJeT_ZnbgiekqR4h9XpnVDM8RNEj_vsglcred_0T6R2cKFxVFsZjLFoSpAsWoZ0gx/exec";

const summaryDiv = document.getElementById("summary");
const ctx = document.getElementById("pieChart");

// -------------------------------
// Fetch latest data from Google Sheet
// -------------------------------
async function fetchExpenses() {
  summaryDiv.innerHTML = "⏳ Loading...";
  try {
    const res = await fetch(API_URL);
    const json = await res.json();
    const data = json.data;

    // ✅ Use only the last non-empty row (latest day total)
    let lastRow = data[data.length - 1];
    while (lastRow && (!lastRow["Date"] || lastRow["Date"] === "")) {
      data.pop();
      lastRow = data[data.length - 1];
    }

    if (!lastRow) {
      summaryDiv.innerHTML = "<p>No expense data found.</p>";
      return;
    }

    // Build category totals from that row
    const categoryTotals = {};
    Object.keys(lastRow).forEach(key => {
      if (key !== "Date" && key !== "Grand Total" && lastRow[key] > 0) {
        categoryTotals[key] = Number(lastRow[key]);
      }
    });

    renderSummary(categoryTotals);
    renderChart(categoryTotals);

  } catch (err) {
    console.error("Error fetching expenses:", err);
    summaryDiv.innerHTML = "<p>⚠️ Unable to fetch data. Check API URL or network connection.</p>";
  }
}

// -------------------------------
// Render the summary table
// -------------------------------
function renderSummary(categoryTotals) {
  const total = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  let html = `
    <h3>📊 Today's Summary</h3>
    <table>
      <tr><th>Category</th><th>Amount (₹)</th></tr>
  `;

  for (const [cat, val] of Object.entries(categoryTotals)) {
    html += `<tr><td>${cat}</td><td style="text-align:right;">₹${val.toFixed(2)}</td></tr>`;
  }

  html += `
      <tr style="background:#f2f2f2;">
        <td><b>Total</b></td>
        <td style="text-align:right;"><b>₹${total.toFixed(2)}</b></td>
      </tr>
    </table>
  `;

  summaryDiv.innerHTML = html;
}

// -------------------------------
// Render the Pie Chart
// -------------------------------
function renderChart(categoryTotals) {
  new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(categoryTotals),
      datasets: [{
        data: Object.values(categoryTotals),
        backgroundColor: [
          "#4CAF50", "#FF6384", "#36A2EB", "#FFCE56", "#9C27B0", "#FF9800",
          "#00BCD4", "#8BC34A", "#FFEB3B", "#795548"
        ]
      }]
    },
    options: {
      plugins: {
        legend: { position: "bottom" },
        title: { display: true, text: "Expense Distribution (Latest)" }
      }
    }
  });
}

// -------------------------------
// Button Actions
// -------------------------------

// Refresh Data
document.getElementById("refreshBtn").addEventListener("click", fetchExpenses);

// Send Email Report
document.getElementById("emailBtn").addEventListener("click", async () => {
  alert("📧 Sending report...");
  try {
    await fetch(`${API_URL}?action=email`);
    alert("✅ Email report sent successfully!");
  } catch (err) {
    alert("❌ Failed to send email. Check your Apps Script URL or permissions.");
  }
});

// -------------------------------
// Register Service Worker for PWA
// -------------------------------
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").then(() => {
    console.log("✅ Service Worker registered");
  }).catch(err => {
    console.error("⚠️ Service Worker registration failed:", err);
  });
}

// -------------------------------
// Auto-load data on startup
// -------------------------------
fetchExpenses();

