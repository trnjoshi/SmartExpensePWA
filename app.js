// Replace this with your own Apps Script web-app URL:
const API_URL = "https://script.google.com/macros/s/AKfycbxJJeT_ZnbgiekqR4h9XpnVDM8RNEj_vsglcred_0T6R2cKFxVFsZjLFoSpAsWoZ0gx/exec";

const summaryDiv = document.getElementById("summary");
const ctx = document.getElementById("pieChart");

async function fetchExpenses() {
  summaryDiv.innerHTML = "⏳ Loading...";
  const res = await fetch(API_URL);
  const json = await res.json();
  const data = json.data;

  // Summarize category totals
  const categoryTotals = {};
  data.forEach(row => {
    Object.keys(row).forEach(key => {
      if (key !== "Date" && key !== "Grand Total" && row[key] > 0) {
        categoryTotals[key] = (categoryTotals[key] || 0) + Number(row[key]);
      }
    });
  });

  renderSummary(categoryTotals);
  renderChart(categoryTotals);
}

function renderSummary(categoryTotals) {
  const total = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  let html = `<h3>📊 Summary</h3><table><tr><th>Category</th><th>Amount (₹)</th></tr>`;
  for (const [cat, val] of Object.entries(categoryTotals)) {
    html += `<tr><td>${cat}</td><td style="text-align:right;">₹${val.toFixed(2)}</td></tr>`;
  }
  html += `<tr><td><b>Total</b></td><td style="text-align:right;"><b>₹${total.toFixed(2)}</b></td></tr></table>`;
  summaryDiv.innerHTML = html;
}

function renderChart(categoryTotals) {
  new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(categoryTotals),
      datasets: [{
        data: Object.values(categoryTotals),
        backgroundColor: ["#4CAF50", "#FF6384", "#36A2EB", "#FFCE56", "#9C27B0", "#FF9800"]
      }]
    },
    options: {
      plugins: {
        legend: { position: "bottom" },
        title: { display: true, text: "Expense Distribution" }
      }
    }
  });
}

// Refresh button
document.getElementById("refreshBtn").addEventListener("click", fetchExpenses);

// Send-email button
document.getElementById("emailBtn").addEventListener("click", async () => {
  alert("📧 Sending report...");
  await fetch(`${API_URL}?action=email`);
  alert("✅ Email report sent!");
});

// PWA service worker registration
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

// Auto-load data when app opens
fetchExpenses();
