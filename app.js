// --- Configuration et constantes ---
const CONFIG = {
  ANIMATION: {
    DURATION: 300,
    EASING: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  STORAGE: {
    KEY: 'padam-week-v2'
  },
  UI: {
    DEBOUNCE_DELAY: 1500,
    TOAST_DURATION: 3000
  },
 
};

// --- Données services ---
const SERVICES = [
  { code: "n1", start: "05:40", end: "11:20", category: "matin" },
  { code: "n2", start: "05:40", end: "11:20", category: "matin" },
  { code: "n3", start: "06:40", end: "10:20", category: "matin" },
  { code: "n4", start: "06:40", end: "12:20", category: "matin" },
  { code: "n5", start: "06:40", end: "13:20", category: "matin" },
  { code: "n6", start: "06:40", end: "12:20", category: "matin" },
  { code: "n7", start: "06:40", end: "12:20", category: "matin" },
  { code: "n8", start: "06:10", end: "09:50", category: "matin" },
  { code: "n9", start: "11:40", end: "14:20", category: "midi" },
  { code: "n10", start: "12:40", end: "18:20", category: "aprem" },
  { code: "n11", start: "11:40", end: "18:20", category: "aprem" },
  { code: "n12", start: "11:40", end: "18:20", category: "aprem" },
  { code: "n13", start: "12:40", end: "19:20", category: "aprem" },
  { code: "n14", start: "13:40", end: "20:20", category: "soir" },
  { code: "n15", start: "13:40", end: "19:20", category: "soir" },
  { code: "n16", start: "12:40", end: "19:20", category: "soir" },
  { code: "n17", start: "14:40", end: "20:20", category: "soir" },
  { code: "n18", start: "19:00", end: "21:40", category: "soir" },
  { code: "n20", start: "06:00", end: "09:40", category: "matin" },
  { code: "n21", start: "11:10", end: "14:50", category: "midi" },
  { code: "n22", start: "16:30", end: "20:10", category: "soir" },
  { code: "n24", start: "16:00", end: "21:40", category: "soir" },
  { code: "n28", start: "07:00", end: "13:40", category: "matin" },
  { code: "n29", start: "15:00", end: "21:40", category: "soir" },
  { code: "Nuit 2", start: "21:30", end: "06:00", category: "nuit" },
  { code: "Nuit 3", start: "21:30", end: "23:00", category: "nuit" },
  { code: "Nuit 4", start: "21:30", end: "23:00", category: "nuit" },
  { code: "Nuit 5", start: "21:30", end: "23:00", category: "nuit" },
  { code: "Nuit 6", start: "21:30", end: "23:00", category: "nuit" },
  { code: "Nuit 7", start: "21:30", end: "23:00", category: "nuit" },
  { code: "Nuit 8", start: "21:30", end: "00:30", category: "nuit" },
  { code: "Nuit 9", start: "21:30", end: "00:30", category: "nuit" },
  { code: "reserve", start: null, end: null, category: "special" },
  { code: "repos", start: null, end: null, category: "special" },
];

function getPlanningFromTable() {
  const saved = localStorage.getItem(CONFIG.STORAGE.KEY);
  const state = saved ? JSON.parse(saved) : {};

  const planning = Object.entries(state).map(([dayIndex, data]) => ({
    dayIndex: Number(dayIndex),
    nJour: data.nJour || null,
    service1: data.service1 || null,
    service2: data.service2 || null,
    km1: data.km1 || 0,
    km2: data.km2 || 0
  }));

  return {
    createdAt: new Date().toISOString(),
    planning: planning
  };
}
