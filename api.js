/**
 * Cernion a2mdm API Client — Asset Portfolio Health-Check
 * Compatible with ES5 (no arrow functions, no const/let, no template literals)
 */

var CernionAPI = function(baseUrl, tenantId, token) {
  this.baseUrl = baseUrl || "https://api.cernion.de/";
  this.tenantId = tenantId || "agentic-hackathon";
  this.token = token || "";
};

CernionAPI.prototype._headers = function() {
  var h = {
    "Content-Type": "application/json",
    "x-tenant-id": this.tenantId
  };
  if (this.token) h["Authorization"] = "Bearer " + this.token;
  return h;
};

CernionAPI.prototype.health = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    fetch(self.baseUrl + "api/openapi.json", {
      method: "GET",
      headers: self._headers()
    })
    .then(function(r) {
      if (r.ok) resolve({ ok: true, status: r.status });
      else resolve({ ok: false, status: r.status });
    })
    .catch(function(e) {
      resolve({ ok: false, error: e.message || "Failed to fetch" });
    });
  });
};

CernionAPI.prototype.getMelos = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    fetch(self.baseUrl + "api/edm/melos", {
      method: "GET",
      headers: self._headers()
    })
    .then(function(r) {
      if (r.ok) return r.json();
      throw new Error("HTTP " + r.status);
    })
    .then(function(data) { resolve(data); })
    .catch(function(e) { resolve(DEMO_MELOS); });
  });
};

CernionAPI.prototype.getTimeSeries = function(meloId, obis) {
  var self = this;
  return new Promise(function(resolve, reject) {
    fetch(self.baseUrl + "api/edm/timeseries?meloId=" + encodeURIComponent(meloId) + "&obis=" + encodeURIComponent(obis || "1-0:2.7.0"), {
      method: "GET",
      headers: self._headers()
    })
    .then(function(r) {
      if (r.ok) return r.json();
      throw new Error("HTTP " + r.status);
    })
    .then(function(data) { resolve(data); })
    .catch(function(e) { resolve(DEMO_YIELDS[obis] || DEMO_YIELDS["1-0:2.7.0"]); });
  });
};

// =====================================================================
// DEMO DATA — Asset Portfolio
// =====================================================================

var DEMO_MELOS = [
  {
    "meloId": "melo-pv-hofheim-01",
    "type": "physical",
    "name": "PV-Anlage Hofheim",
    "obisRegisters": [{"obis": "1-0:2.7.0", "direction": "feedin"}],
    "sourceType": "smart-meter",
    "metadata": {
      "capacityKw": 920,
      "location": "Hofheim, Industriegebiet Nord",
      "installationType": "ground-mounted",
      "commissioningDate": "2012-06-15",
      "eegPeriodYears": 20,
      "expectedYieldKwh": 966000,
      "actualYieldKwh": 874000,
      "performanceRatio": 0.905,
      "technicalStatus": "good",
      "assetType": "PV-Freiflache"
    }
  },
  {
    "meloId": "melo-pv-wiesbaden-02",
    "type": "physical",
    "name": "PV-Anlage Wiesbaden",
    "obisRegisters": [{"obis": "1-0:2.7.0", "direction": "feedin"}],
    "sourceType": "smart-meter",
    "metadata": {
      "capacityKw": 1200,
      "location": "Wiesbaden, Verwaltungsgebaude",
      "installationType": "roof-mounted",
      "commissioningDate": "2016-03-22",
      "eegPeriodYears": 20,
      "expectedYieldKwh": 1140000,
      "actualYieldKwh": 1165000,
      "performanceRatio": 1.022,
      "technicalStatus": "excellent",
      "assetType": "PV-Dach"
    }
  },
  {
    "meloId": "melo-wind-esterau-01",
    "type": "physical",
    "name": "Windpark Esterau",
    "obisRegisters": [{"obis": "1-0:2.7.0", "direction": "feedin"}],
    "sourceType": "smart-meter",
    "metadata": {
      "capacityKw": 3000,
      "location": "Esterau, Landkreis Kassel",
      "installationType": "wind-onshore",
      "commissioningDate": "2014-11-01",
      "eegPeriodYears": 20,
      "expectedYieldKwh": 7500000,
      "actualYieldKwh": 6800000,
      "performanceRatio": 0.907,
      "technicalStatus": "fair",
      "assetType": "Wind-Onshore"
    }
  },
  {
    "meloId": "melo-biogas-grossen-01",
    "type": "physical",
    "name": "Biogas-Grossen",
    "obisRegisters": [{"obis": "1-0:2.7.0", "direction": "feedin"}],
    "sourceType": "smart-meter",
    "metadata": {
      "capacityKw": 500,
      "location": "Grossen, Landwirtschaftliche Genossenschaft",
      "installationType": "biogas-plant",
      "commissioningDate": "2011-09-10",
      "eegPeriodYears": 20,
      "expectedYieldKwh": 4500000,
      "actualYieldKwh": 4320000,
      "performanceRatio": 0.960,
      "technicalStatus": "good",
      "assetType": "Biogas"
    }
  },
  {
    "meloId": "melo-pv-klein-05",
    "type": "physical",
    "name": "PV-Anlage Klein",
    "obisRegisters": [{"obis": "1-0:2.7.0", "direction": "feedin"}],
    "sourceType": "smart-meter",
    "metadata": {
      "capacityKw": 85,
      "location": "Klein, Sportplatz",
      "installationType": "roof-mounted",
      "commissioningDate": "2019-04-01",
      "eegPeriodYears": 20,
      "expectedYieldKwh": 89250,
      "actualYieldKwh": 76500,
      "performanceRatio": 0.857,
      "technicalStatus": "fair",
      "assetType": "PV-Dach"
    }
  },
  {
    "meloId": "melo-pv-speicher-06",
    "type": "virtual",
    "name": "PV + Speicher Klein-Winternheim",
    "obisRegisters": [],
    "sourceType": "manual",
    "metadata": {
      "capacityKw": 200,
      "location": "Klein-Winternheim, Wohngebiet",
      "installationType": "solar-plus-storage",
      "commissioningDate": "2021-07-12",
      "eegPeriodYears": 20,
      "expectedYieldKwh": 208000,
      "actualYieldKwh": 215000,
      "performanceRatio": 1.034,
      "technicalStatus": "excellent",
      "assetType": "PV + Speicher"
    }
  }
];

var DEMO_YIELDS = {
  "1-0:2.7.0": [
    {"ts": "2025-01-01T00:00:00Z", "value": 0},
    {"ts": "2025-01-01T01:00:00Z", "value": 0},
    {"ts": "2025-01-01T02:00:00Z", "value": 0},
    {"ts": "2025-01-01T03:00:00Z", "value": 0},
    {"ts": "2025-01-01T04:00:00Z", "value": 0},
    {"ts": "2025-01-01T05:00:00Z", "value": 0},
    {"ts": "2025-01-01T06:00:00Z", "value": 12},
    {"ts": "2025-01-01T07:00:00Z", "value": 45},
    {"ts": "2025-01-01T08:00:00Z", "value": 120},
    {"ts": "2025-01-01T09:00:00Z", "value": 280},
    {"ts": "2025-01-01T10:00:00Z", "value": 450},
    {"ts": "2025-01-01T11:00:00Z", "value": 620},
    {"ts": "2025-01-01T12:00:00Z", "value": 720},
    {"ts": "2025-01-01T13:00:00Z", "value": 680},
    {"ts": "2025-01-01T14:00:00Z", "value": 540},
    {"ts": "2025-01-01T15:00:00Z", "value": 320},
    {"ts": "2025-01-01T16:00:00Z", "value": 80},
    {"ts": "2025-01-01T17:00:00Z", "value": 12},
    {"ts": "2025-01-01T18:00:00Z", "value": 0},
    {"ts": "2025-01-01T19:00:00Z", "value": 0},
    {"ts": "2025-01-01T20:00:00Z", "value": 0},
    {"ts": "2025-01-01T21:00:00Z", "value": 0},
    {"ts": "2025-01-01T22:00:00Z", "value": 0},
    {"ts": "2025-01-01T23:00:00Z", "value": 0}
  ]
};
