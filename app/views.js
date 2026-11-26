// HTML for each page of Home Ledger, built from data.js.
// Every figure names its source; every chart has a table twin.
// Controls are plain buttons and forms; main.js re-renders on change.

import {
  RETRIEVED,
  HOUSEHOLD,
  INCOME,
  CATEGORIES,
  categoryById,
  BUDGETS,
  GOALS,
  BILLS,
  HES23,
  SOURCES,
  sourceByKey,
  MONTH_LABELS,
} from './data.js';
import { lineChart, barChart, donutChart, dataTable, CHART_COLORS } from './charts.js';

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function money(n, cents = false) {
  const v = cents ? n.toFixed(2) : Math.round(n).toLocaleString('en-SG');
  return `S$${v}`;
}

export function pct(n, digits = 1) {
  return `${(n * 100).toFixed(digits)}%`;
}

export function sourceLine(keys) {
  const names = keys
    .map((k) => {
      const s = sourceByKey(k);
      return s ? `${s.publisher}, ${s.title}` : k;
    })
    .join('; ');
  return `<p class="source-line">Source: ${esc(names)}. Figures retrieved ${esc(RETRIEVED)}.</p>`;
}

function kpiCard(label, value, detail, src) {
  return `<div class="kpi">
    <div class="label">${esc(label)}</div>
    <div class="value">${esc(value)}</div>
    <div class="detail">${esc(detail)}</div>
    ${src ? `<div class="src">Source: ${esc(src)}</div>` : ''}
  </div>`;
}

function monthButtons(state, id) {
  const months = ['2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11'];
  return `<div class="controls" role="group" aria-label="Month">
    <span class="group-label">Month:</span>
    ${months
      .map(
        (m) =>
          `<button class="range-btn" data-action="month" data-page="${id}" data-value="${m}" aria-pressed="${state.month === m}">${esc(m.slice(5))} ’26</button>`,
      )
      .join('')}
  </div>`;
}

function viewControls(state, id) {
  return `<div class="controls" role="group" aria-label="Display">
    <span class="group-label">Show as:</span>
    <button class="toggle" data-action="view" data-page="${id}" data-value="chart" aria-pressed="${state.view === 'chart'}">Chart</button>
    <button class="toggle" data-action="view" data-page="${id}" data-value="table" aria-pressed="${state.view === 'table'}">Table</button>
  </div>`;
}

function budgetBar(cat, spent, budget) {
  const ratio = budget > 0 ? spent / budget : 0;
  const over = spent > budget;
  const width = Math.min(100, Math.round(ratio * 100));
  const cls = over ? 'over' : ratio > 0.97 ? 'warm' : 'ok';
  return `<div class="budget-row">
    <div class="budget-head"><span><span class="swatch" style="background:${cat.color}"></span>${esc(cat.label)}</span>
    <span><strong>${money(spent)}</strong> of ${money(budget)} · ${over ? `${money(spent - budget)} over` : `${money(budget - spent)} left`}</span></div>
    <div class="bar-track"><div class="bar-fill ${cls}" style="width:${width}%"></div></div>
  </div>`;
}

// ---------------------------------------------------------------- dashboard

export function dashboard(S) {
  const slices = CATEGORIES.map((c) => ({
    label: c.label,
    value: Math.round(S.totals[c.id] || 0),
    color: c.color,
    note: `${c.label}: ${money(S.totals[c.id] || 0)}`,
  })).filter((s) => s.value > 0);
  const trendPts = S.history.map((h) => ({ x: h.label, y: Math.round(h.spent) }));
  const trendTable = dataTable(S.history, [
    { label: 'Month', get: (r) => r.label },
    { label: 'Spent', get: (r) => money(r.spent) },
    { label: 'Saved', get: (r) => money(r.saved) },
    { label: 'Savings rate', get: (r) => pct(r.rate) },
  ]);
  const overCats = CATEGORIES.filter((c) => (S.totals[c.id] || 0) > S.budgets[c.id]);
  const unpaid = S.bills.filter((b) => !S.billsPaid[b.id]);
  const nextBill = unpaid[0];
  return `
<p class="kicker">Household budget · ${esc(HOUSEHOLD.home)}</p>
<h1>Home Ledger</h1>
<p class="lede">Every dollar has a job. ${esc(HOUSEHOLD.name)} — ${esc(HOUSEHOLD.members)} —
tracks income, spending, budgets, goals and bills in one place. Figures below
are the sample household’s own records; national averages beside them come
from the Department of Statistics.</p>

${monthButtons(S, 'dashboard')}


<div class="card">
  <h3>Where the money went — ${esc(MONTH_LABELS[S.month])}</h3>
  <div class="split">
    <div class="donut-box">${donutChart(slices, { centre: money(S.spent), centreSub: 'spent in ' + MONTH_LABELS[S.month] })}
      <ul class="legend-list">
        ${CATEGORIES.map((c) => `<li><span><span class="swatch" style="background:${c.color}"></span>${esc(c.label)}</span><strong>${money(S.totals[c.id] || 0)}</strong></li>`).join('')}
      </ul>
    </div>
    <div>
      <p>Housing, food and transport take ${pct((S.totals.housing + S.totals.food + S.totals.transport) / S.spent)} of this
      household’s spending — the same three categories lead the national
      average too (63.2% of Singapore household spending in 2023, DOS).</p>
      <p>Food splits ${money(S.foodGroceries)} on groceries and ${money(S.foodEatingOut)} eating out.
      Nationally, eating out is the bigger half: S$966 of the S$1,422 average
      food bill in 2023.</p>
      <p><a href="#/budgets">Budgets in full &rarr;</a> &nbsp; <a href="#/transactions">Every transaction &rarr;</a></p>
    </div>
  </div>
  ${sourceLine(['HES23'])}
</div>

<div class="kpi-grid">
  ${kpiCard('Take-home pay', money(INCOME.monthly), MONTH_LABELS[S.month] + ' · after CPF & tax', 'Sample household records')}
  ${kpiCard('Spent', money(S.spent), MONTH_LABELS[S.month] + ' · ' + S.txCount + ' transactions', 'Sample household records')}
  ${kpiCard('Saved', money(S.saved), 'Savings rate ' + pct(S.rate) + ' · 6-month average ' + pct(S.avgRate), 'Sample household records')}
  ${kpiCard('Singapore average spend', money(HES23.totalExclImputed), 'Per household, per month, 2023 (excl. imputed rent)', 'DOS, Household Expenditure Survey 2023')}
  ${kpiCard('Biggest category', categoryById(S.biggest).label, money(S.totals[S.biggest]) + ' · ' + pct(S.totals[S.biggest] / S.spent) + ' of spending', 'Sample household records')}
  ${kpiCard('Budget status', overCats.length === 0 ? 'All under budget' : overCats.length + ' over budget', overCats.length === 0 ? 'Every category inside its target' : 'Over: ' + overCats.map((c) => c.label).join(', '), 'Sample household records')}
</div>

<div class="card">
  <h3>Spending over six months</h3>
  ${viewControls(S, 'dashboard-trend')}
  ${S.view === 'table' ? trendTable : lineChart(trendPts, { unit: 'sgd' })}
  <p>Monthly spending has stayed between ${money(S.minSpent)} and ${money(S.maxSpent)} since June.
  September was the dearest month — a dental bill and new school shoes pushed
  health and clothing up together. The household saved ${money(S.totalSaved)} across the six months.</p>
</div>

<div class="two-col">
  <div class="card">
    <h3>Budget vs actual — ${esc(MONTH_LABELS[S.month])}</h3>
    ${CATEGORIES.slice(0, 5).map((c) => budgetBar(c, S.totals[c.id] || 0, S.budgets[c.id])).join('')}
    <p><a href="#/budgets">All ten categories &rarr;</a></p>
  </div>
  <div class="card">
    <h3>Coming up</h3>
    <ul class="fact-list">
      <li><strong>${nextBill ? esc(nextBill.due) : '—'}</strong> — ${nextBill ? `${esc(nextBill.label)} · ${money(nextBill.amount)}` : 'No unpaid bills.'}</li>
      <li><strong>${money(S.billsTotal)}</strong> — bills due in December 2026 (${S.bills.length} bills, ${S.bills.filter((b) => S.billsPaid[b.id]).length} already marked paid).</li>
      <li><strong>${money(S.goalsSaved)}</strong> — saved across ${S.goals.length} goals; the emergency fund is ${pct(S.goals[0].saved / S.goals[0].target)} funded.</li>
    </ul>
    <p><a href="#/goals">Goals &rarr;</a> &nbsp; <a href="#/planner">Plan a budget &rarr;</a></p>
  </div>
</div>

<div class="card">
  <h3>Bills due in December 2026 — ${money(S.billsTotal)} in all</h3>
  <table class="data-table"><thead><tr><th>Due</th><th>Bill</th><th>Amount</th><th></th></tr></thead>
  <tbody>
  ${S.bills.map((b) => `<tr><td>${esc(b.due)}</td><td>${esc(b.label)}${b.auto ? ' <span class="small">(auto GIRO)</span>' : ''}</td><td>${money(b.amount, true)}</td><td>${S.billsPaid[b.id] ? `<span class="paid">Paid ✓</span> <button class="mini-btn" data-action="bill-toggle" data-bill="${b.id}">Undo</button>` : `<button class="mini-btn" data-action="bill-toggle" data-bill="${b.id}">Mark paid</button>`}</td></tr>`).join('')}
  </tbody></table>
  <p class="small">${S.bills.filter((b) => S.billsPaid[b.id]).length} of ${S.bills.length} marked paid · ${money(S.bills.filter((b) => !S.billsPaid[b.id]).reduce((s, b) => s + b.amount, 0))} still to pay.</p>
</div>

<div class="callout"><p><strong>About these numbers.</strong> The Tan household is a sample
household created to show the site working — its transactions are illustrative,
not a real family’s records. National figures are real and sourced: the
Department of Statistics’ Household Expenditure Survey 2023 is the benchmark
throughout. See <a href="#/sources">Sources</a>.</p></div>
`;
}

// ---------------------------------------------------------------- transactions

export function transactionsPage(S) {
  const rows = S.filteredTx;
  const total = rows.reduce((s, t) => s + t.amount, 0);
  return `
<p class="kicker">Money in, money out</p>
<h1>Transactions</h1>
<p class="lede">Every transaction of ${esc(MONTH_LABELS['2026-11'])} (to 26 November),
${S.tx.length} in all. Search, filter by category, add your own — totals
update at once. Amounts are the sample household’s records.</p>

<div class="card">
  <h3>Find a transaction</h3>
  <div class="controls">
    <label class="field"><span>Search</span>
      <input type="search" id="tx-search" placeholder="e.g. NTUC, petrol, tuition" value="${esc(S.txQuery)}"></label>
    <label class="field"><span>Category</span>
      <select id="tx-category">
        <option value="all">All categories</option>
        ${CATEGORIES.map((c) => `<option value="${c.id}" ${S.txCat === c.id ? 'selected' : ''}>${esc(c.label)}</option>`).join('')}
      </select></label>
  </div>
  <p class="small">${rows.length} transaction${rows.length === 1 ? '' : 's'} shown · ${money(total)} in total.</p>
  <table class="data-table tx-table"><thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th><th></th></tr></thead>
  <tbody>
  ${rows
    .map(
      (t) => `<tr><td>${t.day} Nov</td><td>${esc(t.desc)}</td><td><span class="swatch" style="background:${categoryById(t.cat).color}"></span> ${esc(categoryById(t.cat).label)}</td><td>${money(t.amount, true)}</td><td>${t.added ? `<button class="mini-btn" data-action="tx-delete" data-tx="${t.id}">Delete</button>` : ''}</td></tr>`,
    )
    .join('') || '<tr><td colspan="5">No transactions match. Try another search.</td></tr>'}
  </tbody></table>
</div>

<div class="card">
  <h3>Add a transaction</h3>
  <form id="add-tx" class="form-grid">
    <label class="field"><span>Day (Nov 2026)</span>
      <input type="number" name="day" min="1" max="30" value="27" required></label>
    <label class="field"><span>Description</span>
      <input type="text" name="desc" maxlength="80" placeholder="e.g. NTUC FairPrice — groceries" required></label>
    <label class="field"><span>Category</span>
      <select name="cat">${CATEGORIES.map((c) => `<option value="${c.id}">${esc(c.label)}</option>`).join('')}</select></label>
    <label class="field"><span>Amount (S$)</span>
      <input type="number" name="amount" min="0.01" step="0.01" placeholder="0.00" required></label>
    <div class="field"><span>&nbsp;</span><button class="primary-btn" type="submit">Add transaction</button></div>
  </form>
  <p class="small">Added transactions are kept in this browser only (local storage) and are marked so they can be deleted. The original 56 transactions are the sample record and cannot be deleted.</p>
</div>

<div class="card">
  <h3>Spending by category — November</h3>
  ${barChart(CATEGORIES.map((c) => ({ x: c.label.split(' ')[0], y: Math.round(S.totals[c.id] || 0), color: c.color })), { unit: 'sgd' })}
  <p>Education is the second-biggest line this month: childcare after subsidy
  (S$650), tuition (S$280), student care (S$180), piano (S$120) and books
  (S$36.50). It is also the category most families underestimate when they
  first write a budget.</p>
</div>
`;
}

// ---------------------------------------------------------------- budgets

export function budgetsPage(S) {
  const totalBudget = CATEGORIES.reduce((s, c) => s + S.budgets[c.id], 0);
  const totalSpent = CATEGORIES.reduce((s, c) => s + (S.totals[c.id] || 0), 0);
  const rows = CATEGORIES.map((c) => ({
    label: c.label,
    budget: S.budgets[c.id],
    spent: S.totals[c.id] || 0,
  }));
  const table = dataTable(rows, [
    { label: 'Category', get: (r) => r.label },
    { label: 'Budget', get: (r) => money(r.budget) },
    { label: 'Spent', get: (r) => money(r.spent) },
    {
      label: 'Left / over',
      get: (r) => (r.spent <= r.budget ? `${money(r.budget - r.spent)} left` : `${money(r.spent - r.budget)} over`),
    },
  ]);
  return `
<p class="kicker">Targets vs reality</p>
<h1>Budgets</h1>
<p class="lede">Ten category budgets for ${esc(MONTH_LABELS[S.month])}, set from the
household’s six-month average and the national pattern. Edit any target —
the bars and the total move at once.</p>

<div class="kpi-grid">
  ${kpiCard('Total budget', money(totalBudget), 'Across ten categories')}
  ${kpiCard('Spent so far', money(totalSpent), MONTH_LABELS[S.month] + ' to 26 November')}
  ${kpiCard('Remaining', money(totalBudget - totalSpent), totalSpent <= totalBudget ? 'Inside the plan' : 'Over the plan')}
</div>

<div class="card">
  <h3>Budget vs actual — ${esc(MONTH_LABELS[S.month])}</h3>
  ${viewControls(S, 'budgets')}
  ${S.view === 'table'
    ? table
    : CATEGORIES.map((c) => budgetBar(c, S.totals[c.id] || 0, S.budgets[c.id])).join('')}
  <p>Every category is inside its target this month. The tightest is clothing
  (S$148.90 of S$150) after school shoes; the loosest is recreation (S$186.80
  of S$250) — the Sentosa trip still left room for a movie night.</p>
</div>

<div class="card">
  <h3>Edit a budget</h3>
  <form id="edit-budgets" class="form-grid">
    ${CATEGORIES.map(
      (c) => `<label class="field"><span>${esc(c.label)}</span>
        <input type="number" name="budget-${c.id}" min="0" step="1" value="${S.budgets[c.id]}"></label>`,
    ).join('')}
    <div class="field"><span>&nbsp;</span><button class="primary-btn" type="submit">Save budgets</button></div>
  </form>
  <p class="small">Budgets are kept in this browser only. The 50/30/20 rule of thumb —
  50% needs, 30% wants, 20% savings — would put this household’s needs at
  ${money(INCOME.monthly * 0.5)}, wants at ${money(INCOME.monthly * 0.3)} and savings at
  ${money(INCOME.monthly * 0.2)}. This month it saves ${pct(S.rate)}, above the 20% line. Try the <a href="#/planner">planner</a> to build your own.</p>
</div>

<div class="card">
  <h3>How the targets were set</h3>
  <ul class="fact-list">
    <li><strong>Housing S$1,800</strong> — mortgage S$1,320 plus utilities, town council and broadband, rounded up from the six-month average.</li>
    <li><strong>Food S$1,100</strong> — groceries about S$650 and eating out about S$390 in November; the national average is S$1,422.</li>
    <li><strong>Education S$1,300</strong> — childcare, tuition, student care and enrichment are fixed costs, so the target is set just above them.</li>
    <li><strong>Insurance S$510</strong> — life, home and Integrated Shield premiums, all fixed monthly amounts.</li>
  </ul>
  ${sourceLine(['HES23'])}
</div>
`;
}

// ---------------------------------------------------------------- goals

export function goalsPage(S) {
  return `
<p class="kicker">Saving with a purpose</p>
<h1>Goals</h1>
<p class="lede">Four savings goals, funded from the ${money(S.saved)} saved in
${esc(MONTH_LABELS[S.month])}. Add a contribution to any goal — the bar and
the finish date move at once.</p>

<div class="kpi-grid">
  ${kpiCard('Saved across goals', money(S.goalsSaved), S.goals.length + ' goals')}
  ${kpiCard('Emergency fund', pct(S.goals[0].saved / S.goals[0].target), money(S.goals[0].saved) + ' of ' + money(S.goals[0].target))}
  ${kpiCard('Next milestone', 'Japan holiday', money(S.goals[1].target - S.goals[1].saved) + ' to go · ' + pct(S.goals[1].saved / S.goals[1].target) + ' funded')}
</div>

${S.goals
  .map((g) => {
    const ratio = Math.min(1, g.saved / g.target);
    const left = Math.max(0, g.target - g.saved);
    const monthsAtRate = S.saved > 0 ? Math.ceil(left / Math.max(1, Math.round(S.saved * 0.5))) : null;
    return `<div class="card">
    <h3>${esc(g.name)}</h3>
    <p>${esc(g.note)}</p>
    <div class="budget-row">
      <div class="budget-head"><span><strong>${money(g.saved)}</strong> of ${money(g.target)}</span>
      <span>${pct(ratio)} · ${left > 0 ? money(left) + ' to go' : 'Fully funded'}</span></div>
      <div class="bar-track"><div class="bar-fill ${ratio >= 1 ? 'ok' : ratio >= 0.6 ? 'warm' : ''}" style="width:${Math.round(ratio * 100)}%"></div></div>
    </div>
    <div class="controls">
      <span class="group-label">Add:</span>
      <button class="toggle" data-action="goal-add" data-goal="${g.id}" data-amount="100">+ S$100</button>
      <button class="toggle" data-action="goal-add" data-goal="${g.id}" data-amount="500">+ S$500</button>
      <button class="toggle" data-action="goal-add" data-goal="${g.id}" data-amount="1000">+ S$1,000</button>
      ${monthsAtRate !== null && left > 0 ? `<span class="small">At half of this month’s savings, done in about ${monthsAtRate} month${monthsAtRate === 1 ? '' : 's'}.</span>` : ''}
    </div>
  </div>`;
  })
  .join('')}

<div class="card">
  <h3>Start a new goal</h3>
  <form id="add-goal" class="form-grid">
    <label class="field"><span>Goal name</span>
      <input type="text" name="name" maxlength="60" placeholder="e.g. New washing machine" required></label>
    <label class="field"><span>Target (S$)</span>
      <input type="number" name="target" min="1" step="1" placeholder="1000" required></label>
    <label class="field"><span>Already saved (S$)</span>
      <input type="number" name="saved" min="0" step="1" value="0"></label>
    <div class="field"><span>&nbsp;</span><button class="primary-btn" type="submit">Add goal</button></div>
  </form>
  <p class="small">A common rule is three to six months of spending in an emergency fund
  before saving for anything else. This household’s six-month spending averages
  ${money(S.avgSpent)}, so its S$35,000 target is six months’ cover.</p>
</div>
`;
}

// ---------------------------------------------------------------- planner

export function plannerPage(S) {
  const p = S.planner;
  const needs = Math.round(p.income * 0.5);
  const wants = Math.round(p.income * 0.3);
  const savings = p.income - needs - wants;
  const hesNeeds = Math.round(p.income * 0.63);
  return `
<p class="kicker">Build your own budget</p>
<h1>Budget Planner</h1>
<p class="lede">Enter your household’s take-home pay and the planner splits it by the
50/30/20 rule and by the national spending pattern — then shows what each
category would get. Change any number and the plan updates at once.</p>

<div class="card">
  <h3>Your household</h3>
  <form id="planner-form" class="form-grid" onsubmit="return false">
    <label class="field"><span>Monthly take-home pay (S$)</span>
      <input type="number" id="pl-income" min="500" step="100" value="${p.income}"></label>
    <label class="field"><span>Adults</span>
      <input type="number" id="pl-adults" min="1" max="6" step="1" value="${p.adults}"></label>
    <label class="field"><span>Children</span>
      <input type="number" id="pl-children" min="0" max="8" step="1" value="${p.children}"></label>
    <label class="field"><span>Housing type</span>
      <select id="pl-housing">
        <option value="hdb" ${p.housing === 'hdb' ? 'selected' : ''}>HDB flat</option>
        <option value="condo" ${p.housing === 'condo' ? 'selected' : ''}>Condominium</option>
        <option value="landed" ${p.housing === 'landed' ? 'selected' : ''}>Landed property</option>
        <option value="rent" ${p.housing === 'rent' ? 'selected' : ''}>Renting</option>
      </select></label>
  </form>
</div>

<div class="kpi-grid">
  ${kpiCard('Needs (50%)', money(needs), 'Housing, food, transport, bills, insurance')}
  ${kpiCard('Wants (30%)', money(wants), 'Eating out, recreation, holidays')}
  ${kpiCard('Savings (20%)', money(savings), 'Emergency fund first, then goals')}
</div>

<div class="card">
  <h3>Suggested category plan — ${money(p.income)} a month</h3>
  <p>The shares below apply the national pattern (DOS Household Expenditure
  Survey 2023) to your pay, with housing adjusted for a ${p.housing === 'hdb' ? 'HDB flat' : p.housing === 'condo' ? 'condominium' : p.housing === 'landed' ? 'landed property' : 'rented home'}.
  Nationally, housing, food and transport take 63.2% of spending.</p>
  ${p.plan.map((row) => budgetBar(categoryById(row.id), row.amount, p.income)).join('')}
  <p class="small">Bars show each category’s share of take-home pay. The plan is a
  starting point: a household with a car, a helper or school-age children
  will shift money between lines — the point is that the lines add up to
  the pay cheque.</p>
  ${sourceLine(['HES23'])}
</div>

<div class="card">
  <h3>Three checks before you start</h3>
  <ul class="fact-list">
    <li><strong>Is the emergency fund full?</strong> Three to six months of spending, in cash, before investing or prepaying a loan. At ${money(p.income)} a month, six months of the national average spend is ${money(HES23.totalExclImputed * 6)}.</li>
    <li><strong>Does the plan survive a bad month?</strong> Keep one category — usually food or recreation — as the flex line you can cut without touching a bill.</li>
    <li><strong>Is it automatic?</strong> Move the savings on payday, not at month-end. What is left at month-end is rarely what you meant to save.</li>
  </ul>
</div>
`;
}

// ---------------------------------------------------------------- benchmarks

export function benchmarksPage(S) {
  const showPct = S.benchView === 'pct';
  const rows = HES23.categories.map((h) => {
    const ours = h.id === 'accommodation' ? null : S.novTotals[h.id] || 0;
    return { ...h, ours };
  });
  const table = dataTable(rows, [
    { label: 'Category', get: (r) => r.label },
    { label: 'Singapore average', get: (r) => (showPct ? `${r.share.toFixed(1)}%` : money(r.amount)) },
    { label: 'Tan household (Nov)', get: (r) => (r.ours === null ? '—' : showPct ? pct(r.ours / S.spent) : money(r.ours)) },
    {
      label: 'Difference',
      get: (r) => (r.ours === null ? '—' : (r.ours - r.amount >= 0 ? '+' : '') + money(r.ours - r.amount)),
    },
  ]);
  const bars = HES23.categories.slice(0, 8).map((h) => ({
    x: h.label.split(' ')[0],
    y: h.amount,
    color: CHART_COLORS.teal,
  }));
  return `
<p class="kicker">How Singapore spends</p>
<h1>Benchmarks</h1>
<p class="lede">The national average household spent S$5,931 a month in 2023, on the
Department of Statistics’ Household Expenditure Survey. Compare any household
against it — category by category — and see where the money really goes.</p>

<div class="kpi-grid">
  ${kpiCard('Average spend', money(HES23.totalExclImputed), 'Per household, per month, 2023 (excl. imputed rent)', 'DOS, HES 2023')}
  ${kpiCard('Average income', money(HES23.incomeAllSources), 'Per household, per month, from all sources, 2023', 'DOS, HES 2023')}
  ${kpiCard('Online spending', money(HES23.online.amount), HES23.online.share + '% of spending · ' + HES23.online.households + '% of households buy online', 'DOS, HES 2023')}
  ${kpiCard('Top three categories', '63.2%', 'Housing 29.8% · food 20.0% · transport 13.4%', 'DOS, HES 2023')}
  ${kpiCard('Lowest-income households', money(3233), 'Average monthly spend, lowest 20% by income, 2023', 'DOS, HES 2023')}
  ${kpiCard('Median monthly pay', money(5775), 'Full-time employed residents, June 2025, incl. employer CPF', 'MOM, CLFS')}
</div>

<div class="card">
  <h3>National average by category, 2023</h3>
  ${barChart(bars, { unit: 'sgd' })}
  <p>Housing dominates because the survey counts imputed rent — the rent an
  owner-occupier would pay for their own home (S$1,188 a month on average).
  Cash spending is lower: S$5,931 a month excluding imputed rent.</p>
  ${sourceLine(['HES23'])}
</div>

<div class="card">
  <h3>Singapore average vs the Tan household</h3>
  <div class="controls" role="group" aria-label="Units">
    <span class="group-label">Show as:</span>
    <button class="toggle" data-action="bench-view" data-value="sgd" aria-pressed="${!showPct}">Dollars</button>
    <button class="toggle" data-action="bench-view" data-value="pct" aria-pressed="${showPct}">Share of spending</button>
  </div>
  ${table}
  <p>The Tan household spends ${money(S.spent - HES23.totalExclImputed)} ${S.spent >= HES23.totalExclImputed ? 'more' : 'less'} than the
  national cash average of ${money(HES23.totalExclImputed)}. Its food bill is lower — it cooks
  more and eats out less — while education is higher, with two children in
  childcare, tuition and enrichment. Note the national housing figure includes
  imputed rent, so it is not directly comparable with a mortgage payment.</p>
  ${sourceLine(['HES23'])}
</div>

<div class="card">
  <h3>Food: groceries vs eating out</h3>
  <ul class="fact-list">
    <li><strong>${money(HES23.foodSplit[0].amount)}</strong> — ${esc(HES23.foodSplit[0].label)}, national average per month, 2023.</li>
    <li><strong>${money(HES23.foodSplit[1].amount)}</strong> — ${esc(HES23.foodSplit[1].label)}, national average per month, 2023.</li>
    <li><strong>${money(S.foodGroceries)} / ${money(S.foodEatingOut)}</strong> — the Tan household’s groceries vs eating out, November 2026.</li>
  </ul>
  <p>Singapore households spend more than twice as much eating out as on
  groceries. Hawker centres, coffee shops and food courts take about half of
  the eating-out bill — the cheapest way to eat out, and the hardest line to
  cut without cooking more.</p>
  ${sourceLine(['HES23'])}
</div>

<div class="card">
  <h3>Average spending by household type, 2023</h3>
  ${dataTable(HES23.byIncome, [
    { label: 'Household', get: (r) => r.label },
    { label: 'Average monthly spend', get: (r) => money(r.amount) },
  ])}
  <p>Averages hide wide gaps: the lowest-income fifth of households spends
  ${money(3233)} a month, less than a quarter of a landed-property household’s
  ${money(13545)}. Government transfers averaged ${money(HES23.transfersPerMember)} per household
  member in 2023, most for the lowest-income households.</p>
  ${sourceLine(['HES23'])}
</div>
`;
}

// ---------------------------------------------------------------- sources

export function sourcesPage() {
  const items = SOURCES.map(
    (s) => `<li><span class="key">${esc(s.key)}</span> — <strong>${esc(s.publisher)}</strong>,
      <em>${esc(s.title)}</em>. ${esc(s.note)}</li>`,
  ).join('');
  return `
<p class="kicker">About the data</p>
<h1>Sources</h1>
<p class="lede">Two kinds of numbers live on this site. National figures come from the
publications below and were checked on ${esc(RETRIEVED)}. The Tan household
is a sample household: its figures are illustrative records made to show the
site working, not a real family’s data.</p>

<div class="card">
  <h3>Publications</h3>
  <ul class="source-list">${items}</ul>
</div>

<div class="card">
  <h3>Definitions worth knowing</h3>
  <ul class="fact-list">
    <li><strong>Imputed rent</strong> is the rent an owner-occupier would pay for their own home. The survey adds S$1,188 a month of it to the average household’s spending; excluding it, average spending is S$5,931.</li>
    <li><strong>Take-home pay</strong> is pay after employee CPF contributions (20% for workers aged 55 and below) and income tax. Employer CPF (17%) is on top of gross pay, not inside it.</li>
    <li><strong>50/30/20</strong> is a rule of thumb: 50% of take-home pay to needs, 30% to wants, 20% to savings. It is a starting point, not a law.</li>
    <li><strong>Median monthly income</strong> (MOM) covers full-time employed residents and includes employer CPF contributions.</li>
  </ul>
</div>

<div class="card">
  <h3>What this site leaves out</h3>
  <p>Figures that could not be traced to a primary official release are not
  shown as national facts. Where a publisher revised a series, the latest
  release is used. The Tan household’s November transactions are listed in
  full on the Transactions page; earlier months are shown as monthly totals
  only.</p>
  <p class="small">Home Ledger is an independent sample site. It is not affiliated
  with, or endorsed by, the Department of Statistics or any government agency.
  Figures are reproduced with attribution; check the original publications
  before quoting them elsewhere. This site stores nothing on a server: budgets,
  goals and added transactions live in your own browser.</p>
</div>
`;
}

export function missingPage() {
  return `<h1>Page not found</h1>
<p>There is no section at this address. Try one of the sections above, or
<a href="#/">go back to the dashboard</a>.</p>`;
}
