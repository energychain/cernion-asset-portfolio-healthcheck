/**
 * Asset Portfolio Health-Check — App Logic
 * ES5 compatible, no arrow functions, no let/const
 */

var api, charts = {}, demoMode = true;
var currentMelos = [];

function init() {
  var url = localStorage.getItem("cernion_api_url") || "https://api.cernion.de/";
  var tenant = localStorage.getItem("cernion_tenant_id") || "agentic-hackathon";
  var token = localStorage.getItem("cernion_api_token") || "";
  api = new CernionAPI(url, tenant, token);
  document.getElementById("apiUrl").value = url;
  document.getElementById("tenantId").value = tenant;
  document.getElementById("apiToken").value = token;

  api.health().then(function(r) {
    demoMode = !r.ok;
    var badge = document.getElementById("connectionStatus");
    if (r.ok) {
      badge.textContent = "Live";
      badge.classList.add("success");
    } else {
      badge.textContent = "Demo";
      badge.classList.add("warning");
    }
    return api.getMelos();
  }).then(function(melos) {
    currentMelos = melos;
    renderDashboard();
    renderCharts();
  });

  // Tab navigation
  var tabs = document.querySelectorAll(".tab-link");
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener("click", function(e) {
      e.preventDefault();
      switchTab(this.getAttribute("data-tab"));
    });
  }
}

function switchTab(tabName) {
  var tabs = document.querySelectorAll(".tab-link");
  var contents = document.querySelectorAll(".tab-content");
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].classList.remove("active");
    if (tabs[i].getAttribute("data-tab") === tabName) tabs[i].classList.add("active");
  }
  for (var j = 0; j < contents.length; j++) {
    contents[j].classList.remove("active");
  }
  document.getElementById(tabName + "Tab").classList.add("active");
}

function getRemainingEegYears(melo) {
  var md = melo.metadata || {};
  var start = md.commissioningDate;
  var period = md.eegPeriodYears || 20;
  if (!start) return 0;
  var startYear = parseInt(start.substring(0, 4), 10);
  var now = new Date().getFullYear();
  var endYear = startYear + period;
  return Math.max(0, endYear - now);
}

function getYearsUntilExpiry(melo) {
  return getRemainingEegYears(melo);
}

function renderDashboard() {
  var total = currentMelos.length;
  var totalCap = 0;
  var totalHealth = 0;
  var expiring = 0;
  var recommendations = [];
  var performanceSum = 0;

  for (var i = 0; i < currentMelos.length; i++) {
    var m = currentMelos[i];
    var md = m.metadata || {};
    totalCap += md.capacityKw || 0;
    var perf = md.performanceRatio || 0.95;
    performanceSum += perf;

    var remaining = getRemainingEegYears(m);
    if (remaining <= 3) expiring++;

    // Generate recommendations
    if (remaining <= 3) {
      if (perf < 0.9) {
        recommendations.push({
          icon: "🔴",
          text: m.name + " — EEG läuft in " + remaining + " Jahren aus, Performance nur " + Math.round(perf * 100) + "%. Empfohlen: Stilllegung prüfen.",
          severity: "high"
        });
      } else {
        recommendations.push({
          icon: "🟡",
          text: m.name + " — EEG läuft in " + remaining + " Jahren aus, Performance gesund. Empfohlen: Repowering- oder PPA-Optionen prüfen.",
          severity: "medium"
        });
      }
    } else if (perf < 0.88) {
      recommendations.push({
        icon: "🟡",
        text: m.name + " — Performance nur " + Math.round(perf * 100) + "% (Soll < 92%). Wartung/Instandsetzung empfohlen.",
        severity: "medium"
      });
    }
  }

  var avgHealth = total > 0 ? (performanceSum / total * 100) : 0;

  document.getElementById("totalAssets").textContent = total;
  document.getElementById("portfolioHealth").textContent = avgHealth.toFixed(1) + "%";
  document.getElementById("portfolioHealth").style.color = avgHealth >= 95 ? "#27ae60" : avgHealth >= 85 ? "#f39c12" : "#e74c3c";
  document.getElementById("expiringCount").textContent = expiring;
  document.getElementById("totalCapacity").textContent = totalCap.toLocaleString("de-DE") + " kWp/W";

  // Render recommendations
  var recHtml = "";
  if (recommendations.length === 0) {
    recHtml = "<p>✅ Keine kritischen Empfehlungen. Portfolio in gutem Zustand.</p>";
  } else {
    recHtml = "<ul>";
    for (var r = 0; r < recommendations.length; r++) {
      var rec = recommendations[r];
      recHtml += "<li style=\"margin-bottom:0.5rem\">" + rec.icon + " " + rec.text + "</li>";
    }
    recHtml += "</ul>";
  }
  document.getElementById("recommendations").innerHTML = recHtml;

  // Render portfolio table
  var tableHtml = '<table class="striped">';
  tableHtml += '<thead><tr><th>Anlage</th><th>Typ</th><th>Installiert</th><th>Leistung</th><th>Status</th><th>Performance</th><th>EEG Rest</th><th>Ampel</th></tr></thead>';
  tableHtml += '<tbody>';
  for (var t = 0; t < currentMelos.length; t++) {
    var melo = currentMelos[t];
    var mt = melo.metadata || {};
    var remYears = getYearsUntilExpiry(melo);
    var perfPct = Math.round((mt.performanceRatio || 0.95) * 100);
    var statusText = mt.technicalStatus || "good";
    var statusBadge = statusText === "excellent" ? "<span class=\"badge success\">Hervorragend</span>" : statusText === "good" ? "<span class=\"badge\">Gut</span>" : "<span class=\"badge warning\">Achtung</span>";
    var color = perfPct >= 95 ? "#27ae60" : perfPct >= 88 ? "#f39c12" : "#e74c3c";
    var light = remYears <= 3 ? "🔴" : remYears <= 8 ? "🟡" : "🟢";

    tableHtml += "<tr>";
    tableHtml += "<td><strong>" + (melo.name || melo.meloId) + "</strong></td>";
    tableHtml += "<td>" + (mt.assetType || "Unbekannt") + "</td>";
    tableHtml += "<td>" + (mt.commissioningDate || "—") + "</td>";
    tableHtml += "<td>" + (mt.capacityKw || 0) + " kWp/W</td>";
    tableHtml += "<td>" + statusBadge + "</td>";
    tableHtml += "<td style=\"color:" + color + "\"><strong>" + perfPct + "%</strong></td>";
    tableHtml += "<td>" + remYears + " Jahre</td>";
    tableHtml += "<td style=\"font-size:1.5rem; text-align:center\">" + light + "</td>";
    tableHtml += "</tr>";
  }
  tableHtml += "</tbody></table>";
  document.getElementById("portfolioTable").innerHTML = tableHtml;
}

function renderCharts() {
  // Destroy existing charts
  Object.keys(charts).forEach(function(key) {
    if (charts[key]) charts[key].destroy();
  });

  // 1. Type Distribution (Doughnut)
  var typeData = {};
  for (var i = 0; i < currentMelos.length; i++) {
    var mt = currentMelos[i].metadata || {};
    var type = mt.assetType || "Unbekannt";
    if (!typeData[type]) typeData[type] = 0;
    typeData[type] += mt.capacityKw || 0;
  }
  var typeLabels = Object.keys(typeData);
  var typeValues = typeLabels.map(function(l) { return typeData[l]; });

  var typeCtx = document.getElementById("typeChart").getContext("2d");
  charts.type = new Chart(typeCtx, {
    type: "doughnut",
    data: {
      labels: typeLabels,
      datasets: [{
        data: typeValues,
        backgroundColor: ["#3498db", "#2ecc71", "#f39c12", "#e74c3c", "#9b59b6", "#1abc9c"]
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "bottom" } }
    }
  });

  // 2. Annual Yield Comparison (Bar) - actual vs expected
  var yieldLabels = [];
  var actualYields = [];
  var expectedYields = [];
  for (var j = 0; j < currentMelos.length; j++) {
    var mm = currentMelos[j].metadata || {};
    yieldLabels.push(currentMelos[j].name || currentMelos[j].meloId);
    actualYields.push(Math.round((mm.actualYieldKwh || 0) / 1000));
    expectedYields.push(Math.round((mm.expectedYieldKwh || 0) / 1000));
  }

  var yieldCtx = document.getElementById("yieldChart").getContext("2d");
  charts.yield = new Chart(yieldCtx, {
    type: "bar",
    data: {
      labels: yieldLabels,
      datasets: [
        { label: "Ist (MWh)", data: actualYields, backgroundColor: "#3498db" },
        { label: "Soll (MWh)", data: expectedYields, backgroundColor: "rgba(52,152,219,0.3)" }
      ]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true, title: { display: true, text: "MWh" } } }
    }
  });

  // 3. Performance vs Expected (Horizontal Bar)
  var perfLabels = [];
  var perfValues = [];
  var perfColors = [];
  for (var k = 0; k < currentMelos.length; k++) {
    perfLabels.push(currentMelos[k].name || currentMelos[k].meloId);
    var pr = ((currentMelos[k].metadata || {}).performanceRatio || 0.95) * 100;
    perfValues.push(pr);
    perfColors.push(pr >= 95 ? "#27ae60" : pr >= 88 ? "#f39c12" : "#e74c3c");
  }

  var perfCtx = document.getElementById("performanceChart").getContext("2d");
  charts.performance = new Chart(perfCtx, {
    type: "bar",
    data: {
      labels: perfLabels,
      datasets: [{
        label: "Performance %",
        data: perfValues,
        backgroundColor: perfColors
      }]
    },
    options: {
      responsive: true,
      indexAxis: "y",
      scales: { x: { min: 70, max: 110, title: { display: true, text: "% vom Soll" } } }
    }
  });

  // 4. Remaining EEG Years (Bar)
  var remLabels = [];
  var remValues = [];
  var remColors = [];
  for (var r = 0; r < currentMelos.length; r++) {
    remLabels.push(currentMelos[r].name || currentMelos[r].meloId);
    var ry = getYearsUntilExpiry(currentMelos[r]);
    remValues.push(ry);
    remColors.push(ry <= 3 ? "#e74c3c" : ry <= 8 ? "#f39c12" : "#27ae60");
  }

  var remCtx = document.getElementById("remainingChart").getContext("2d");
  charts.remaining = new Chart(remCtx, {
    type: "bar",
    data: {
      labels: remLabels,
      datasets: [{
        label: "Restjahre",
        data: remValues,
        backgroundColor: remColors
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true, title: { display: true, text: "Jahre" } } }
    }
  });
}

function testConnection() {
  var url = document.getElementById("apiUrl").value.trim();
  var tenant = document.getElementById("tenantId").value.trim();
  var token = document.getElementById("apiToken").value.trim();
  var result = document.getElementById("testResult");

  localStorage.setItem("cernion_api_url", url);
  localStorage.setItem("cernion_tenant_id", tenant);
  localStorage.setItem("cernion_api_token", token);

  api = new CernionAPI(url, tenant, token);
  result.textContent = "Teste Verbindung…";

  api.health().then(function(r) {
    if (r.ok) {
      result.innerHTML = "✅ Verbindung OK (Status " + r.status + ")";
      location.reload();
    } else {
      result.innerHTML = "⚠️ API-Fehler: Status " + r.status;
    }
  }).catch(function(e) {
    result.innerHTML = "❌ Fehler: " + (e.message || "Verbindung fehlgeschlagen");
  });
}

function resetSettings() {
  localStorage.removeItem("cernion_api_url");
  localStorage.removeItem("cernion_tenant_id");
  localStorage.removeItem("cernion_api_token");
  document.getElementById("apiUrl").value = "https://api.cernion.de/";
  document.getElementById("tenantId").value = "agentic-hackathon";
  document.getElementById("apiToken").value = "";
}

document.addEventListener("DOMContentLoaded", init);
