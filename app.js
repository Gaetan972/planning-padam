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
  SCROLL: {
    SMOOTH: true,
    MOBILE_OPTIMIZED: true
  }
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

  // --- Services de nuit ---
  { code: "Nuit 2", start: "21:30", end: "06:00", category: "nuit" },
  { code: "Nuit 3", start: "21:30", end: "23:00", category: "nuit" },
  { code: "Nuit 4", start: "21:30", end: "23:00", category: "nuit" },
  { code: "Nuit 5", start: "21:30", end: "23:00", category: "nuit" },
  { code: "Nuit 6", start: "21:30", end: "23:00", category: "nuit" },
  { code: "Nuit 7", start: "21:30", end: "23:00", category: "nuit" },
  { code: "Nuit 8", start: "21:30", end: "00:30", category: "nuit" },
  { code: "Nuit 9", start: "21:30", end: "00:30", category: "nuit" },

  // --- Spéciaux ---
  { code: "reserve", start: null, end: null, category: "special" },
  { code: "repos", start: null, end: null, category: "special" },
];

const SERVICE_MAP = Object.fromEntries(SERVICES.map(s => [s.code, s]));
const SERVICE_CATEGORIES = {
  matin: { color: '#f59e0b', name: 'Matin' },
  midi: { color: '#10b981', name: 'Midi' },
  aprem: { color: '#3b82f6', name: 'Après-midi' },
  soir: { color: '#8b5cf6', name: 'Soir' },
  nuit: { color: '#1e293b', name: 'Nuit' },
  special: { color: '#64748b', name: 'Spécial' }
};

const DAYS = [
  { day: "Lundi", nJour: 20 },
  { day: "Mardi", nJour: 21 },
  { day: "Mercredi", nJour: 22 },
  { day: "Jeudi", nJour: 23 },
  { day: "Vendredi", nJour: 24 },
  { day: "Samedi", nJour: 25 },
  { day: "Dimanche", nJour: 26 },
];

// --- Gestionnaire d'état avec historique ---
class PlanningState {
  constructor() {
    this.state = this.load();
    this.history = [];
    this.saveHistory();
  }

  load() {
    try {
      const saved = localStorage.getItem(CONFIG.STORAGE.KEY);
      if (saved) {
        PlanningApp.showToast('Planning chargé depuis la sauvegarde', 'success');
      }
      return JSON.parse(saved) || {};
    } catch {
      PlanningApp.showToast('Nouveau planning créé', 'info');
      return {};
    }
  }

  save() {
    try {
      localStorage.setItem(CONFIG.STORAGE.KEY, JSON.stringify(this.state));
      this.saveHistory();
    } catch (error) {
      PlanningApp.showToast('Erreur de sauvegarde', 'error');
    }
  }

  saveHistory() {
    this.history.push(JSON.parse(JSON.stringify(this.state)));
    if (this.history.length > 10) this.history.shift();
  }

  undo() {
    if (this.history.length > 1) {
      this.history.pop();
      this.state = JSON.parse(JSON.stringify(this.history[this.history.length - 1]));
      this.save();
      PlanningApp.showToast('Action annulée', 'info');
      return true;
    }
    return false;
  }

  updateDay(dayIndex, updates) {
    const key = String(dayIndex);
    this.state[key] = { ...(this.state[key] || {}), ...updates };
    this.save();
  }

  reset() {
    this.state = {};
    this.save();
    PlanningApp.showToast('Planning réinitialisé', 'success');
  }
}

// --- Utilitaires temps ---
const TimeUtils = {
  toMinutes(hhmm) {
    if (!hhmm) return null;
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  },

  formatHHMM(minutes) {
    if (minutes == null) return "";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}:${String(m).padStart(2, '0')}`;
  },

  durationMinutes(start, end) {
    if (!start || !end) return 0;
    const s = this.toMinutes(start), e = this.toMinutes(end);
    return ((e - s + 1440) % 1440);
  },

  rangeLabel(start, end) {
    return (start && end ? `${start} – ${end}` : "");
  },

  calculateTotalTime(dayState) {
    const s1 = SERVICE_MAP[dayState.service1] || {};
    const s2 = SERVICE_MAP[dayState.service2] || {};
    return this.durationMinutes(s1.start, s1.end) + this.durationMinutes(s2.start, s2.end);
  }
};

// --- Gestionnaire d'UI AMÉLIORÉ avec scroll fluide ---
class UIManager {
  constructor() {
    this.tbody = document.getElementById('tbody');
    this.totalWeekEl = document.getElementById('totalWeek');
    this.totalKmWeekEl = document.getElementById('totalKmWeek');
    this.debounceTimers = new Map();
    
    this.initSmoothScroll();
    this.setupTouchOptimizations();
  }

  // NOUVEAU : Initialisation du scroll fluide
  initSmoothScroll() {
    // Appliquer le CSS pour le scroll fluide
    this.injectSmoothScrollCSS();
    
    // Désactiver le zoom sur les inputs pour éviter les sauts
    this.disableInputZoom();
    
    // Optimiser le scroll sur mobile
    this.optimizeMobileScroll();
  }

  // NOUVEAU : Configuration des optimisations tactiles
  setupTouchOptimizations() {
    // Empêcher les gestes de zoom accidentels
    document.addEventListener('touchmove', (e) => {
      if (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') {
        e.preventDefault();
      }
    }, { passive: false });

    // Améliorer le responsive des menus déroulants
    this.enhanceSelectMenus();
  }

  // NOUVEAU : Injection du CSS pour le scroll fluide
  injectSmoothScrollCSS() {
    const scrollCSS = `
      /* Scroll fluide pour tous les appareils */
      .table-container {
        -webkit-overflow-scrolling: touch !important;
        /*scroll-behavior: smooth;*/
        overflow-anchor: auto;
      }

      /* Optimisations mobiles pour le scroll */
      @media (max-width: 768px) {
        .table-container {
          scroll-snap-type: y mandatory;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
        }

        .day-row {
          scroll-snap-align: start;
          scroll-snap-stop: always;
        }

        /* Réduire la répaint pendant le scroll */
        .card, table, tbody, tr, td {
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000;
        }

        /* Améliorer la performance du scroll */
        tbody {
          contain: layout style paint;
        }
      }

      /* Désactiver le pull-to-refresh sur mobile */
      body {
        overscroll-behavior-y: contain;
      }

      /* Scrollbars personnalisées plus fines sur mobile */
      .table-container::-webkit-scrollbar {
        width: 4px;
      }

      .table-container::-webkit-scrollbar-thumb {
        background: var(--primary);
        border-radius: 2px;
      }

      .table-container::-webkit-scrollbar-track {
        background: transparent;
      }

      /* Éviter les flashs blancs pendant le scroll sur iOS */
      .table-container {
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        user-select: none;
      }

      /* Réactiver la sélection pour les inputs */
      .table-container input, 
      .table-container select {
        -webkit-user-select: text;
        user-select: text;
        -webkit-touch-callout: default;
      }

      /* Animation de scroll fluide */
      .smooth-scroll {
        scroll-behavior: smooth;
      }

      /* Indicateur de scroll pour mobile */
      .scroll-indicator {
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        width: 40px;
        height: 4px;
        background: rgba(92, 156, 139, 0.3);
        border-radius: 2px;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .scroll-indicator.visible {
        opacity: 1;
      }
    `;

    const style = document.createElement('style');
    style.textContent = scrollCSS;
    document.head.appendChild(style);
  }

  // NOUVEAU : Désactiver le zoom sur les inputs
  disableInputZoom() {
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      viewportMeta.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
  }

  // NOUVEAU : Optimisations spécifiques mobile
  optimizeMobileScroll() {
    if (!this.isMobile()) return;

    const tableContainer = document.querySelector('.table-container') || 
                          document.querySelector('.card > div:first-child');
    
    if (tableContainer) {
      // Ajouter la classe pour le scroll fluide
      tableContainer.classList.add('smooth-scroll');
      
      // Créer un indicateur de scroll
      this.createScrollIndicator(tableContainer);
      
      // Optimiser les événements de touch
      this.optimizeTouchEvents(tableContainer);
    }
  }

  // NOUVEAU : Détection mobile
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768;
  }

  // NOUVEAU : Créer un indicateur de scroll
  createScrollIndicator(container) {
    const indicator = document.createElement('div');
    indicator.className = 'scroll-indicator';
    container.style.position = 'relative';
    container.appendChild(indicator);

    let hideTimeout;
    const showIndicator = () => {
      indicator.classList.add('visible');
      clearTimeout(hideTimeout);
      hideTimeout = setTimeout(() => {
        indicator.classList.remove('visible');
      }, 1500);
    };

    container.addEventListener('scroll', showIndicator);
    container.addEventListener('touchstart', showIndicator);
  }

  // NOUVEAU : Optimiser les événements tactiles
  optimizeTouchEvents(container) {
    let startY;
    let isScrolling = false;

    container.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
      isScrolling = false;
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
      if (!startY) return;
      
      const y = e.touches[0].clientY;
      const diff = y - startY;
      
      if (Math.abs(diff) > 5) {
        isScrolling = true;
      }
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      if (isScrolling) {
        e.preventDefault();
      }
      startY = null;
      isScrolling = false;
    }, { passive: false });
  }

  // NOUVEAU : Améliorer les menus déroulants sur mobile
  enhanceSelectMenus() {
    if (!this.isMobile()) return;

    document.addEventListener('focus', (e) => {
      if (e.target.tagName === 'SELECT') {
        // Scroll doucement vers l'élément
        setTimeout(() => {
          e.target.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }, 100);
      }
    }, true);
  }

  createElement(tag, classes = '', attributes = {}) {
    const el = document.createElement(tag);
    if (classes) el.className = classes;
    Object.entries(attributes).forEach(([key, value]) => el.setAttribute(key, value));
    
    // NOUVEAU : Ajouter des attributs pour le mobile
    if (this.isMobile() && (tag === 'select' || tag === 'input')) {
      el.setAttribute('data-mobile-optimized', 'true');
    }
    
    return el;
  }

  animateElement(element, animation, duration = CONFIG.ANIMATION.DURATION) {
    element.style.animation = `${animation} ${duration}ms ${CONFIG.ANIMATION.EASING}`;
    setTimeout(() => element.style.animation = '', duration);
  }

  debounce(key, callback, delay = CONFIG.UI.DEBOUNCE_DELAY) {
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
    }
    this.debounceTimers.set(key, setTimeout(callback, delay));
  }

  createServiceSelect(value, onChange, serviceType) {
    const sel = this.createElement('select', 'service-select', {
      'data-service-type': serviceType
    });

    // Option vide avec emoji
    const optNone = this.createElement('option');
    optNone.value = "";
    optNone.textContent = '➕ Sélectionner';
    sel.appendChild(optNone);

    // Grouper les services par catégorie
    const categories = {};
    SERVICES.forEach(service => {
      if (!categories[service.category]) {
        categories[service.category] = [];
      }
      categories[service.category].push(service);
    });

    Object.entries(categories).forEach(([category, services]) => {
      const group = this.createElement('optgroup');
      group.label = SERVICE_CATEGORIES[category]?.name || 'Autres';
      
      services.forEach(service => {
        const option = this.createElement('option');
        option.value = service.code;
        option.textContent = `${service.code} (${service.start || '–'} → ${service.end || '–'})`;
        option.dataset.category = category;
        group.appendChild(option);
      });
      
      sel.appendChild(group);
    });

    sel.value = value || "";
    sel.addEventListener('change', (e) => {
      this.animateElement(sel, 'pulse');
      onChange(e.target.value);
      
      // NOUVEAU : Scroll doux après sélection sur mobile
      if (this.isMobile()) {
        setTimeout(() => {
          sel.closest('tr').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest'
          });
        }, 300);
      }
    });

    return sel;
  }

  createNumberInput(value, onChange, placeholder = '0') {
    const input = this.createElement('input', 'km-input', {
      type: 'number',
      min: '0',
      step: '0.1',
      placeholder: placeholder,
      inputmode: 'decimal'
    });
    
    input.value = value || 0;
    
    input.addEventListener('input', (e) => {
      const value = e.target.value === '' ? 0 : Number(e.target.value);
      this.animateElement(input, 'pulse');
      onChange(value);
    });

    // NOUVEAU : Optimisation pour le clavier mobile
    input.addEventListener('focus', () => {
      if (this.isMobile()) {
        setTimeout(() => {
          input.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center'
          });
        }, 100);
      }
    });

    return input;
  }

  createDayBadge(day, nJour) {
    const badge = this.createElement('div', 'day-badge');
    badge.innerHTML = `
      <strong>${day}</strong>
      <span class="day-number">${nJour}</span>
    `;
    return badge;
  }

  updateTotals(totalWeek, totalKmWeek) {
    this.animateElement(this.totalWeekEl, 'bounce');
    this.animateElement(this.totalKmWeekEl, 'bounce');
    
    this.totalWeekEl.textContent = TimeUtils.formatHHMM(totalWeek);
    this.totalKmWeekEl.textContent = totalKmWeek.toFixed(1);

    // Animation de progression
    this.totalWeekEl.parentElement.classList.add('updated');
    setTimeout(() => this.totalWeekEl.parentElement.classList.remove('updated'), 1000);
  }
}

// --- Application principale avec optimisations scroll ---
class PlanningApp {
  constructor() {
    this.stateManager = new PlanningState();
    this.ui = new UIManager();
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
    this.setupKeyboardShortcuts();
    this.setupScrollOptimizations(); // NOUVEAU
  }

  // NOUVEAU : Configuration des optimisations de scroll
  setupScrollOptimizations() {
    // Forcer le recalcul des dimensions après le rendu
    setTimeout(() => {
      this.forceReflow();
    }, 100);

    // Observer les changements de taille pour réoptimiser
    this.setupResizeObserver();
  }

  // NOUVEAU : Forcer le reflow pour optimiser le rendu
  forceReflow() {
    const table = document.getElementById('planning');
    if (table) {
      void table.offsetHeight;
    }
  }

  // NOUVEAU : Observer les changements de taille
  setupResizeObserver() {
    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(() => {
        this.ui.optimizeMobileScroll();
      });
      
      const container = document.querySelector('.container');
      if (container) {
        ro.observe(container);
      }
    }
  }

  bindEvents() {
    document.getElementById('btn-reset').addEventListener('click', () => this.resetWeek());
    document.getElementById('btn-export').addEventListener('click', () => this.exportCSV());
    
    // Undo avec Ctrl+Z
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (this.stateManager.undo()) {
          this.render();
        }
      }
    });
  }

  setupKeyboardShortcuts() {
    // Ajouter un indicateur de raccourcis
    const exportBtn = document.getElementById('btn-export');
    exportBtn.title = 'Exporter CSV (Ctrl+S)';

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.exportCSV();
      }
    });
  }

  render() {
    this.ui.tbody.innerHTML = '';
    let totalWeek = 0;
    let totalKmWeek = 0;

    DAYS.forEach((day, index) => {
      const rowState = this.stateManager.state[String(index)] || {
        service1: '', service2: '', nJour: day.nJour, km1: 0, km2: 0
      };

      const s1 = SERVICE_MAP[rowState.service1] || {};
      const s2 = SERVICE_MAP[rowState.service2] || {};

      const totalTime = TimeUtils.calculateTotalTime(rowState);
      totalWeek += totalTime;

      const kmTotal = (rowState.km1 || 0) + (rowState.km2 || 0);
      totalKmWeek += kmTotal;

      const tr = this.createDayRow(day, index, rowState, s1, s2, totalTime, kmTotal);
      this.ui.tbody.appendChild(tr);
    });

    this.ui.updateTotals(totalWeek, totalKmWeek);
  }

  createDayRow(day, index, rowState, s1, s2, totalTime, kmTotal) {
    const tr = this.ui.createElement('tr', 'day-row');
    tr.style.animationDelay = `${index * 50}ms`;
    
    // NOUVEAU : Ajouter un identifiant pour le scroll
    tr.id = `day-${index}`;

    // Colonne Jour
    const tdDay = this.createLabeledCell('Jour');
    tdDay.appendChild(this.ui.createDayBadge(day.day, rowState.nJour || day.nJour));

    // Colonne n du jour (cachée sur mobile)
    const tdN = this.createLabeledCell('n du jour', 'hide-sm');
    const nInput = this.ui.createNumberInput(rowState.nJour, (value) => {
      this.stateManager.updateDay(index, { nJour: value });
      this.ui.debounce(`nJour-${index}`, () => this.render());
    });
    tdN.appendChild(nInput);

    // Services
    const tdS1 = this.createLabeledCell('Service 1');
    tdS1.appendChild(this.ui.createServiceSelect(rowState.service1, (value) => {
      this.stateManager.updateDay(index, { service1: value });
      this.render();
    }, 'service1'));

    const tdS2 = this.createLabeledCell('Service 2');
    tdS2.appendChild(this.ui.createServiceSelect(rowState.service2, (value) => {
      this.stateManager.updateDay(index, { service2: value });
      this.render();
    }, 'service2'));

    // Horaires
    const tdH = this.createLabeledCell('Horaire(s)');
    const horaires = [TimeUtils.rangeLabel(s1.start, s1.end), TimeUtils.rangeLabel(s2.start, s2.end)]
      .filter(Boolean).join(' / ') || '—';
    tdH.textContent = horaires;
    if (horaires !== '—') tdH.classList.add('has-schedule');

    // Durée 2 (cachée sur mobile)
    const tdD2 = this.createLabeledCell('Durée 2', 'hide-sm');
    tdD2.textContent = TimeUtils.formatHHMM(TimeUtils.durationMinutes(s2.start, s2.end));

    // Kilométrages
    const tdKm1 = this.createLabeledCell('Km S1');
    tdKm1.appendChild(this.ui.createNumberInput(rowState.km1, (value) => {
      this.stateManager.updateDay(index, { km1: value });
      this.ui.debounce(`km1-${index}`, () => this.render());
    }));

    const tdKm2 = this.createLabeledCell('Km S2');
    tdKm2.appendChild(this.ui.createNumberInput(rowState.km2, (value) => {
      this.stateManager.updateDay(index, { km2: value });
      this.ui.debounce(`km2-${index}`, () => this.render());
    }));

    // Totaux
    const tdKmTot = this.createLabeledCell('Km (total)');
    tdKmTot.textContent = kmTotal.toFixed(1);
    if (kmTotal > 0) tdKmTot.classList.add('has-km');

    const tdTime = this.createLabeledCell('Durée (total)', 'right');
    tdTime.textContent = TimeUtils.formatHHMM(totalTime);
    if (totalTime > 0) tdTime.classList.add('has-duration');

    [tdDay, tdN, tdS1, tdS2, tdH, tdD2, tdKm1, tdKm2, tdKmTot, tdTime].forEach(td => tr.appendChild(td));
    
    return tr;
  }

  createLabeledCell(labelText, additionalClasses = '') {
    const td = this.ui.createElement('td', additionalClasses);
    td.dataset.label = labelText;
    return td;
  }

  resetWeek() {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toute la semaine ?')) {
      this.stateManager.reset();
      this.render();
    }
  }

  exportCSV() {
    const csv = this.generateCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = this.ui.createElement('a');
    a.href = url;
    a.download = `planning_padam_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    PlanningApp.showToast('Planning exporté en CSV', 'success');
  }

  generateCSV() {
    const header = ['Jour', 'n du jour', 'Service 1', 'Service 2', 'Horaire(s)', 'Durée 2', 'Km S1', 'Km S2', 'Km (total)', 'Durée (total)'];
    const rows = [header];

    DAYS.forEach((day, index) => {
      const rowState = this.stateManager.state[String(index)] || {};
      const s1 = SERVICE_MAP[rowState.service1] || {};
      const s2 = SERVICE_MAP[rowState.service2] || {};

      const d2 = TimeUtils.durationMinutes(s2.start, s2.end);
      const total = TimeUtils.calculateTotalTime(rowState);
      const horaires = [TimeUtils.rangeLabel(s1.start, s1.end), TimeUtils.rangeLabel(s2.start, s2.end)]
        .filter(Boolean).join(' / ');

      const km1 = rowState.km1 || 0;
      const km2 = rowState.km2 || 0;
      const kmTot = km1 + km2;

      rows.push([
        day.day, rowState.nJour || '', rowState.service1 || '', rowState.service2 || '',
        horaires, TimeUtils.formatHHMM(d2), km1, km2, kmTot, TimeUtils.formatHHMM(total)
      ]);
    });

    return rows.map(row => 
      row.map(v => `"${String(v).replaceAll('"', '""')}"`).join(',')
    ).join('\n');
  }

  static showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, CONFIG.UI.TOAST_DURATION);
  }
}

// --- CSS additionnel AMÉLIORÉ avec optimisations scroll ---
const additionalCSS = `
/* Animations */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
  40%, 43% { transform: translate3d(0,-8px,0); }
  70% { transform: translate3d(0,-4px,0); }
  90% { transform: translate3d(0,-2px,0); }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Toast notifications */
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  z-index: 1000;
  transform: translateX(100%);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.toast.show {
  transform: translateX(0);
  opacity: 1;
}

.toast-success { background: rgba(34, 197, 94, 0.9); border: 1px solid rgb(34, 197, 94); }
.toast-error { background: rgba(239, 68, 68, 0.9); border: 1px solid rgb(239, 68, 68); }
.toast-info { background: rgba(59, 130, 246, 0.9); border: 1px solid rgb(59, 130, 246); }

/* Day badge */
.day-badge {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.day-number {
  font-size: 0.75rem;
  color: var(--muted);
  font-weight: 600;
}

/* États visuels */
.has-schedule { color: var(--primary); font-weight: 600; }
.has-km { color: var(--accent); font-weight: 600; }
.has-duration { color: var(--primary-dark); font-weight: 700; }

.badge.updated {
  animation: pulse 0.6s ease;
}

/* Sélecteurs de services */
.service-select optgroup {
  font-weight: 600;
  color: var(--text);
}

.service-select option[data-category="matin"] { background: rgba(245, 158, 11, 0.1); }
.service-select option[data-category="midi"] { background: rgba(16, 185, 129, 0.1); }
.service-select option[data-category="aprem"] { background: rgba(59, 130, 246, 0.1); }
.service-select option[data-category="soir"] { background: rgba(139, 92, 246, 0.1); }
.service-select option[data-category="nuit"] { background: rgba(30, 41, 59, 0.1); color: #1e293b; }
.service-select option[data-category="special"] { background: rgba(100, 116, 139, 0.1); }

/* Lignes animées */
.day-row {
  animation: slideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
}

/* Raccourcis clavier */
.btn[title*="Ctrl"]::after {
  content: " ⌨";
  opacity: 0.6;
  font-size: 0.8em;
}

/* Améliorations pour les inputs */
.km-input {
  width: 80px;
  text-align: center;
}

.service-select {
  min-width: 160px;
}

@media (max-width: 768px) {
  .km-input, .service-select {
    width: 100%;
    min-width: auto;
  }
  
  /* Optimisations supplémentaires pour le mobile */
  .table-container {
    scroll-padding: 20px;
  }
  
  .day-row {
    min-height: 60px;
  }
  
  /* Améliorer la visibilité pendant le scroll */
  .day-row:focus-within {
    background: rgba(92, 156, 139, 0.05) !important;
    transform: scale(1.01);
    transition: all 0.2s ease;
  }
}


`;

// Injection du CSS additionnel
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  new PlanningApp();
});





