// --- Données services ---
const SERVICES = [
  { code: "n1", start: "05:40", end: "11:20" },
  { code: "n2", start: "05:40", end: "11:20" },
  { code: "n3", start: "06:40", end: "10:20" },
  { code: "n4", start: "06:40", end: "12:20" },
  { code: "n5", start: "06:40", end: "13:20" },
  { code: "n6", start: "06:40", end: "12:20" },
  { code: "n7", start: "06:40", end: "12:20" },
  { code: "n8", start: "06:10", end: "09:50" },
  { code: "n9", start: "11:40", end: "14:20" },
  { code: "n10", start: "12:40", end: "18:20" },
  { code: "n11", start: "11:40", end: "18:20" },
  { code: "n12", start: "11:40", end: "18:20" },
  { code: "n13", start: "12:40", end: "19:20" },
  { code: "n14", start: "13:40", end: "20:20" },
  { code: "n15", start: "13:40", end: "19:20" },
  { code: "n16", start: "12:40", end: "19:20" },
  { code: "n17", start: "14:40", end: "20:20" },
  { code: "n18", start: "19:00", end: "21:40" },
  { code: "n20", start: "06:00", end: "09:40" },
  { code: "n21", start: "11:10", end: "14:50" },
  { code: "n22", start: "16:30", end: "20:10" },
  { code: "n24", start: "16:00", end: "21:40" },
  { code: "n28", start: "07:00", end: "13:40" },
  { code: "n29", start: "15:00", end: "21:40" },

  // --- Services de nuit ---
  { code: "Nuit 2", start: "21:30", end: "06:00" },
  { code: "Nuit 3", start: "21:30", end: "23:00" },
  { code: "Nuit 4", start: "21:30", end: "23:00" },
  { code: "Nuit 5", start: "21:30", end: "23:00" },
  { code: "Nuit 6", start: "21:30", end: "23:00" },
  { code: "Nuit 7", start: "21:30", end: "23:00" },
  { code: "Nuit 8", start: "21:30", end: "00:30" },
  { code: "Nuit 9", start: "21:30", end: "00:30" },

  // --- Spéciaux ---
  { code: "reserve", start: null, end: null },
  { code: "repos", start: null, end: null },
];
const SERVICE_MAP = Object.fromEntries(SERVICES.map(s => [s.code, s]));

const DAYS = [
  { day:"Lundi",    nJour:20 },
  { day:"Mardi",    nJour:21 },
  { day:"Mercredi", nJour:22 },
  { day:"Jeudi",    nJour:23 },
  { day:"Vendredi", nJour:24 },
  { day:"Samedi",   nJour:25 },
  { day:"Dimanche", nJour:26 },
];

// --- Utilitaires temps ---
const toMinutes = hhmm => {
  if(!hhmm) return null;
  const [h,m] = hhmm.split(":").map(Number);
  return h*60+m;
};
const formatHHMM = minutes => {
  if(minutes==null) return "";
  const h=Math.floor(minutes/60);
  const m=minutes%60;
  return `${h}:${String(m).padStart(2,'0')}`;
};
const durationMinutes = (start, end) => {
  if(!start || !end) return 0;
  const s=toMinutes(start), e=toMinutes(end);
  return ((e - s + 1440) % 1440); // gère la nuit
};
const rangeLabel = (start, end) => (start && end ? `${start} – ${end}` : "");

// --- Etat & rendu ---
const tbody = document.getElementById('tbody');
const totalWeekEl = document.getElementById('totalWeek');
const totalKmWeekEl = document.getElementById('totalKmWeek');

const load = () => {
  try { return JSON.parse(localStorage.getItem('padam-week')) || {}; }
  catch { return {}; }
};
const save = (state) => localStorage.setItem('padam-week', JSON.stringify(state));

let state = load();

function makeSelect(value, onChange){
  const sel = document.createElement('select');
  const optNone = document.createElement('option');
  optNone.value=""; optNone.textContent='—';
  sel.appendChild(optNone);

  for(const s of SERVICES){
    const o = document.createElement('option');
    o.value=s.code; o.textContent=s.code;
    sel.appendChild(o);
  }

  sel.value = value || "";
  sel.addEventListener('change', e=> onChange(e.target.value));
  return sel;
}

// pour le mode "carte" mobile : ajoute un label au td
function label(td, text){ td.dataset.label = text; return td; }

function render(){
  tbody.innerHTML = '';
  let totalWeek = 0;
  let totalKmWeek = 0;

  DAYS.forEach((d, idx) => {
    const key = String(idx);
    const rowState = state[key] || {
      service1: '', service2: '', nJour: d.nJour, km1: 0, km2: 0
    };

    const s1 = SERVICE_MAP[rowState.service1] || {};
    const s2 = SERVICE_MAP[rowState.service2] || {};

    const label1 = rangeLabel(s1.start, s1.end);
    const label2 = rangeLabel(s2.start, s2.end);
    const horaires = [label1, label2].filter(Boolean).join(' / ') || '—';

    const d1 = durationMinutes(s1.start, s1.end);
    const d2 = durationMinutes(s2.start, s2.end);
    const total = d1 + d2;
    totalWeek += total;

    const tr = document.createElement('tr');

    // Jour + n du jour
    const tdDay = label(document.createElement('td'), 'Jour');
    const head = document.createElement('div'); head.className='row-head';
    const title = document.createElement('strong'); title.textContent=d.day; head.appendChild(title);
    const sub = document.createElement('span'); sub.className='sub'; sub.textContent = rowState.nJour ?? ''; head.appendChild(sub);
    tdDay.appendChild(head);

    const tdN = label(document.createElement('td'), 'n du jour'); tdN.className='hide-sm';
    const nInput = document.createElement('input'); nInput.type='number';
    nInput.value=rowState.nJour ?? '';
    nInput.addEventListener('input', e=>{
      state[key] = { ...rowState, nJour: e.target.value ? Number(e.target.value) : '' };
      save(state);
    });
    tdN.appendChild(nInput);

    // Service 1 & 2
    const tdS1 = label(document.createElement('td'), 'Service 1');
    tdS1.appendChild(makeSelect(rowState.service1, v=>{
      state[key] = { ...rowState, service1:v };
      save(state); render();
    }));

    const tdS2 = label(document.createElement('td'), 'Service 2');
    tdS2.appendChild(makeSelect(rowState.service2, v=>{
      state[key] = { ...rowState, service2:v };
      save(state); render();
    }));

    // Horaires
    const tdH = label(document.createElement('td'), 'Horaire(s)');
    tdH.textContent = horaires;

    // Durée 2
    const tdD2 = label(document.createElement('td'), 'Durée 2'); tdD2.className='hide-sm';
    tdD2.textContent = formatHHMM(d2);

    // KM S1
    const tdKm1 = label(document.createElement('td'), 'Km S1');
    const km1Input = document.createElement('input');
    km1Input.type = 'number'; km1Input.min = '0'; km1Input.step = '0.1';
    km1Input.placeholder = '0'; km1Input.value = rowState.km1 ?? 0;
    km1Input.setAttribute('inputmode','numeric'); // mobile keypad
    km1Input.addEventListener('input', e => {
      const v = e.target.value;
      state[key] = { ...rowState, km1: v === '' ? 0 : Number(v) };
      save(state);
      // pas de render() à chaque frappe pour fluidité
    });
    tdKm1.appendChild(km1Input);

    // KM S2
    const tdKm2 = label(document.createElement('td'), 'Km S2');
    const km2Input = document.createElement('input');
    km2Input.type = 'number'; km2Input.min = '0'; km2Input.step = '0.1';
    km2Input.placeholder = '0'; km2Input.value = rowState.km2 ?? 0;
    km2Input.setAttribute('inputmode','numeric');
    km2Input.addEventListener('input', e => {
      const v = e.target.value;
      state[key] = { ...rowState, km2: v === '' ? 0 : Number(v) };
      save(state);
    });
    tdKm2.appendChild(km2Input);

    // Km total (ligne)
    const kmTotal = (rowState.km1 || 0) + (rowState.km2 || 0);
    totalKmWeek += kmTotal;
    const tdKmTot = label(document.createElement('td'), 'Km (total)');
    tdKmTot.textContent = kmTotal.toFixed(1);

    // Durée totale
    const tdT = label(document.createElement('td'), 'Durée (total)');
    tdT.className='right';
    tdT.textContent = formatHHMM(total);

    [tdDay, tdN, tdS1, tdS2, tdH, tdD2, tdKm1, tdKm2, tdKmTot, tdT].forEach(td => tr.appendChild(td));
    tbody.appendChild(tr); // <<< on ajoute la ligne au tableau
  });

  totalWeekEl.textContent = formatHHMM(totalWeek);
  if (totalKmWeekEl) totalKmWeekEl.textContent = totalKmWeek.toFixed(1);
}

render();

// --- Actions ---
document.getElementById('btn-reset').addEventListener('click', ()=>{
  if(confirm('Réinitialiser la semaine ?')){
    state = {};
    save(state);
    render();
  }
});

// Export CSV
function toCSV(){
  const header = ['Jour','n du jour','Service 1','Service 2','Horaire(s)','Durée 2','Km S1','Km S2','Km (total)','Durée (total)'];
  const rows = [header];

  DAYS.forEach((d, idx)=>{
    const key = String(idx);
    const r = state[key] || {};
    const s1 = SERVICE_MAP[r.service1] || {};
    const s2 = SERVICE_MAP[r.service2] || {};

    const d2 = durationMinutes(s2.start, s2.end);
    const total = durationMinutes(s1.start, s1.end) + d2;
    const horaires = [rangeLabel(s1.start, s1.end), rangeLabel(s2.start, s2.end)]
      .filter(Boolean).join(' / ');

    const km1 = r.km1 || 0;
    const km2 = r.km2 || 0;
    const kmTot = km1 + km2;

    rows.push([
      d.day, r.nJour ?? '', r.service1 || '', r.service2 || '',
      horaires, formatHHMM(d2), km1, km2, kmTot, formatHHMM(total)
    ]);
  });

  return rows
    .map(r => r.map(v => `"${String(v).replaceAll('"','""')}"`).join(','))
    .join('\n');
}

document.getElementById('btn-export').addEventListener('click', ()=>{
  const blob = new Blob([toCSV()], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'planning_padam.csv';
  a.click();
  URL.revokeObjectURL(url);
});
