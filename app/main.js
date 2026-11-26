// Home Ledger — routing, state and controls.
//
//   #/              dashboard
//   #/transactions  #/budgets  #/goals  #/planner  #/benchmarks  #/sources
//
// State lives in memory and is saved to local storage under one key, so a
// budget edit, a goal contribution or an added transaction survives a
// reload. Nothing leaves the browser: there is no server and no account.
// window.__shotReady is false while a page renders and true once it is on
// screen, so a screenshot script knows when to capture.

import {
  RETRIEVED,
  INCOME,
  CATEGORIES,
  categoryById,
  BUDGETS,
  GOALS,
  BILLS,
  NOVEMBER_TX,
  MONTHS,
} from './data.js';
import {
  dashboard,
  transactionsPage,
  budgetsPage,
  goalsPage,
  plannerPage,
  benchmarksPage,
  sourcesPage,
  missingPage,
  money,
  pct,
} from './views.js';

const app = document.getElementById('app');
const navLinks = Array.from(document.querySelectorAll('nav.main-nav a'));
const STORE_KEY = 'home-ledger-v1';

const ROUTES = {
  '': { title: 'Home Ledger — Household Budget', render: dashboard },
  transactions: { title: 'Transactions | Home Ledger', render: transactionsPage },
  budgets: { title: 'Budgets | Home Ledger', render: budgetsPage },
  goals: { title: 'Goals | Home Ledger', render: goalsPage },
  planner: { title: 'Budget Planner | Home Ledger', render: plannerPage },
  benchmarks: { title: 'Benchmarks | Home Ledger', render: benchmarksPage },
  sources: { title: 'Sources | Home Ledger', render: sourcesPage },
};

// --- stored state ---------------------------------------------------------

function loadStored() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function saveStored() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch (e) {
    // Private mode or storage full: the site still works in memory.
  }
}

const stored = loadStored() || {};
const store = {
  month: stored.month || '2026-11',
  view: stored.view || 'chart',
  benchView: stored.benchView || 'sgd',
  txQuery: stored.txQuery || '',
  txCat: stored.txCat || 'all',
  budgets: { ...BUDGETS, ...(stored.budgets || {}) },
  goals: (stored.goals || []).length ? stored.goals : GOALS.map((g) => ({ ...g })),
  addedTx: stored.addedTx || [],
  billsPaid: stored.billsPaid || {},
  planner: { income: 8800, adults: 2, children: 2, housing: 'hdb', ...(stored.planner || {}) },
};

let txSeq = 1000 + store.addedTx.length;

// --- derived figures ------------------------------------------------------

function novemberTotals() {
  const totals = {};
  for (const c of CATEGORIES) totals[c.id] = 0;
  for (const t of allNovemberTx()) totals[t.cat] = (totals[t.cat] || 0) + t.amount;
  return totals;
}

function allNovemberTx() {
  const base = NOVEMBER_TX.map((t) => ({ day: t[0], desc: t[1], cat: t[2], amount: t[3], added: false, id: `base-${t[0]}-${t[1]}` }));
  const added = store.addedTx.map((t) => ({ ...t, added: true }));
  return [...base, ...added].sort((a, b) => a.day - b.day || a.desc.localeCompare(b.desc));
}

function monthTotals(month) {
  if (month === '2026-11') return novemberTotals();
  const m = MONTHS.find((x) => x.key === month);
  const totals = {};
  CATEGORIES.forEach((c, i) => {
    totals[c.id] = m ? m.totals[i] : 0;
  });
  return totals;
}

function monthSpent(month) {
  const t = monthTotals(month);
  return CATEGORIES.reduce((s, c) => s + (t[c.id] || 0), 0);
}

function plannerPlan(p) {
  // Category shares from the national pattern (HES 2023), adjusted so the
  // plan adds up to take-home pay. Housing uses the household's own type.
  const housingShare = p.housing === 'landed' ? 0.34 : p.housing === 'condo' ? 0.3 : p.housing === 'rent' ? 0.32 : 0.28;
  const shares = {
    housing: housingShare,
    food: 0.16,
    transport: 0.1,
    education: p.children > 0 ? 0.12 : 0.02,
    health: 0.04,
    insurance: 0.06,
    recreation: 0.05,
    infocomm: 0.02,
    clothing: 0.02,
    others: 0.03,
  };
  const scale = 0.8 / Object.values(shares).reduce((s, v) => s + v, 0);
  return CATEGORIES.map((c) => ({
    id: c.id,
    amount: Math.round(p.income * shares[c.id] * scale),
  })).sort((a, b) => b.amount - a.amount);
}

function buildState(route) {
  const totals = monthTotals(store.month);
  const spent = CATEGORIES.reduce((s, c) => s + (totals[c.id] || 0), 0);
  const saved = INCOME.monthly - spent;
  const history = MONTHS.map((m) => {
    const sp = m.totals.reduce((s, v) => s + v, 0);
    return { label: m.label, spent: sp, saved: INCOME.monthly - sp, rate: (INCOME.monthly - sp) / INCOME.monthly };
  });
  const nov = novemberTotals();
  const novSpent = CATEGORIES.reduce((s, c) => s + (nov[c.id] || 0), 0);
  history.push({ label: 'Nov 2026', spent: novSpent, saved: INCOME.monthly - novSpent, rate: (INCOME.monthly - novSpent) / INCOME.monthly });
  const allTx = allNovemberTx();
  const q = store.txQuery.trim().toLowerCase();
  const filteredTx = allTx.filter(
    (t) => (store.txCat === 'all' || t.cat === store.txCat) && (!q || t.desc.toLowerCase().includes(q)),
  );
  const foodTx = allTx.filter((t) => t.cat === 'food');
  const groceries = foodTx.filter((t) => /groceries|market/i.test(t.desc)).reduce((s, t) => s + t.amount, 0);
  const eatingOut = foodTx.reduce((s, t) => s + t.amount, 0) - groceries;
  const billsTotal = BILLS.reduce((s, b) => s + b.amount, 0);
  const goalsSaved = store.goals.reduce((s, g) => s + g.saved, 0);
  const biggest = CATEGORIES.reduce((a, c) => ((totals[c.id] || 0) > (totals[a] || 0) ? c.id : a), 'housing');
  const avgSpent = history.reduce((s, h) => s + h.spent, 0) / history.length;
  const avgRate = history.reduce((s, h) => s + h.rate, 0) / history.length;
  return {
    month: store.month,
    view: store.view,
    benchView: store.benchView,
    txQuery: store.txQuery,
    txCat: store.txCat,
    totals,
    novTotals: nov,
    spent,
    saved,
    rate: saved / INCOME.monthly,
    history,
    minSpent: Math.min(...history.map((h) => h.spent)),
    maxSpent: Math.max(...history.map((h) => h.spent)),
    totalSaved: history.reduce((s, h) => s + h.saved, 0),
    avgSpent,
    avgRate,
    tx: allTx,
    txCount: allTx.length,
    filteredTx,
    budgets: store.budgets,
    goals: store.goals,
    goalsSaved,
    bills: BILLS,
    billsPaid: store.billsPaid,
    billsTotal,
    biggest,
    foodGroceries: groceries,
    foodEatingOut: eatingOut,
    planner: { ...store.planner, plan: plannerPlan(store.planner) },
  };
}

// --- rendering ------------------------------------------------------------

function render() {
  window.__shotReady = false;
  const route = location.hash.replace(/^#\/?/, '').split('/')[0];
  const entry = ROUTES[route];
  const S = buildState(route);
  document.title = entry ? entry.title : 'Page not found | Home Ledger';
  app.innerHTML = entry ? entry.render(S) : missingPage();
  for (const link of navLinks) {
    const href = link.getAttribute('href');
    const linkRoute = href.replace(/^#\/?/, '');
    link.classList.toggle('active', linkRoute === route);
    if (linkRoute === route) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

// --- controls -------------------------------------------------------------

app.addEventListener('click', (event) => {
  const btn = event.target.closest('button[data-action]');
  if (!btn) return;
  const action = btn.getAttribute('data-action');
  if (action === 'month') {
    store.month = btn.getAttribute('data-value');
    saveStored();
    render();
  } else if (action === 'view') {
    store.view = btn.getAttribute('data-value');
    saveStored();
    render();
  } else if (action === 'bench-view') {
    store.benchView = btn.getAttribute('data-value');
    saveStored();
    render();
  } else if (action === 'goal-add') {
    const goal = store.goals.find((g) => g.id === btn.getAttribute('data-goal'));
    if (goal) {
      goal.saved = Math.min(goal.target, goal.saved + Number(btn.getAttribute('data-amount')));
      saveStored();
      render();
    }
  } else if (action === 'bill-toggle') {
    const id = btn.getAttribute('data-bill');
    store.billsPaid[id] = !store.billsPaid[id];
    saveStored();
    render();
  } else if (action === 'tx-delete') {
    const id = btn.getAttribute('data-tx');
    store.addedTx = store.addedTx.filter((t) => String(t.id) !== String(id));
    saveStored();
    render();
  }
});

app.addEventListener('input', (event) => {
  const el = event.target;
  if (el.id === 'tx-search') {
    store.txQuery = el.value;
    const S = buildState('transactions');
    const rows = S.filteredTx;
    const total = rows.reduce((s, t) => s + t.amount, 0);
    const tbody = app.querySelector('.tx-table tbody');
    const count = app.querySelector('.card .small');
    if (tbody) {
      tbody.innerHTML =
        rows
          .map(
            (t) =>
              `<tr><td>${t.day} Nov</td><td>${t.desc}</td><td><span class="swatch" style="background:${categoryById(t.cat).color}"></span> ${categoryById(t.cat).label}</td><td>${money(t.amount, true)}</td><td>${t.added ? `<button class="mini-btn" data-action="tx-delete" data-tx="${t.id}">Delete</button>` : ''}</td></tr>`,
          )
          .join('') || '<tr><td colspan="5">No transactions match. Try another search.</td></tr>';
    }
    if (count) count.textContent = `${rows.length} transaction${rows.length === 1 ? '' : 's'} shown · ${money(total)} in total.`;
    return;
  }
  if (el.id === 'tx-category') {
    store.txCat = el.value;
    saveStored();
    render();
    return;
  }
  if (el.id && el.id.startsWith('pl-')) {
    const p = store.planner;
    if (el.id === 'pl-income') p.income = Math.max(500, Number(el.value) || 8800);
    if (el.id === 'pl-adults') p.adults = Math.max(1, Math.min(6, Number(el.value) || 2));
    if (el.id === 'pl-children') p.children = Math.max(0, Math.min(8, Number(el.value) || 0));
    if (el.id === 'pl-housing') p.housing = el.value;
    saveStored();
    render();
    const next = document.getElementById(el.id);
    if (next && (el.id === 'pl-income' || el.id === 'pl-adults' || el.id === 'pl-children')) {
      next.focus();
      try {
        next.setSelectionRange(next.value.length, next.value.length);
      } catch (e) {
        // Number inputs do not support a selection range; focus alone is enough.
      }
    }
  }
});

app.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.target;
  if (form.id === 'add-tx') {
    const data = new FormData(form);
    const day = Math.max(1, Math.min(30, Number(data.get('day')) || 27));
    const desc = String(data.get('desc') || '').trim().slice(0, 80);
    const cat = String(data.get('cat') || 'others');
    const amount = Number(data.get('amount')) || 0;
    if (!desc || amount <= 0) return;
    txSeq += 1;
    store.addedTx.push({ id: `added-${txSeq}`, day, desc, cat, amount: Math.round(amount * 100) / 100 });
    saveStored();
    render();
  } else if (form.id === 'edit-budgets') {
    const data = new FormData(form);
    for (const c of CATEGORIES) {
      const v = Number(data.get(`budget-${c.id}`));
      if (Number.isFinite(v) && v >= 0) store.budgets[c.id] = Math.round(v);
    }
    saveStored();
    render();
  } else if (form.id === 'add-goal') {
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim().slice(0, 60);
    const target = Number(data.get('target')) || 0;
    const saved = Math.max(0, Number(data.get('saved')) || 0);
    if (!name || target <= 0) return;
    store.goals.push({ id: `goal-${Date.now()}`, name, target: Math.round(target), saved: Math.min(Math.round(saved), Math.round(target)), note: 'Added by you.' });
    saveStored();
    render();
  }
});

window.addEventListener('hashchange', render);
render();
