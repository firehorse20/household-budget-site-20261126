// Home Ledger — the figures.
//
// Two kinds of numbers live here, kept strictly apart:
//
//   1. The Tan household: an illustrative sample household (two adults, two
//      children aged 8 and 5, a 4-room HDB flat in Tampines). Its November
//      2026 transactions are listed in full below and every November total
//      on the site is computed from them, so the pages always add up.
//      Earlier months are stored as monthly category totals. Nothing about
//      this household is a real person's data.
//   2. National benchmarks: figures from the Department of Statistics'
//      Household Expenditure Survey 2023, published November 2024, plus
//      the other official sources listed on the Sources page. These are
//      real, published numbers and are labelled as such wherever shown.
//
// Figures retrieved 27 November 2026. Amounts are Singapore dollars.
//
// Sources (short keys; full citations on the Sources page):
//   HES23  DOS, Report on the Household Expenditure Survey 2023 (Nov 2024)
//   MOM-I  MOM, Gross Monthly Income from Employment (CLFS), June 2025
//   CPI25  MAS / MTI, Consumer Price Developments, 2025 average
//   CPF26  CPF Board, contribution rates for employees aged 55 and below
//   GST24  IRAS / MOF, GST rate 9% from 1 January 2024

export const RETRIEVED = '27 November 2026';

export const HOUSEHOLD = {
  name: 'The Tan Family',
  members: 'Two adults, two children (aged 8 and 5)',
  home: '4-room HDB flat, Tampines',
  note: 'Sample household — illustrative figures, not a real family’s data.',
};

// Take-home pay after CPF and tax, per month. Both adults work full-time.
export const INCOME = {
  monthly: 8800,
  parts: [
    { label: 'Parent A — take-home pay', amount: 5200 },
    { label: 'Parent B — take-home pay', amount: 3600 },
  ],
  note: 'Take-home pay after employee CPF (20%) and income tax. CPF rates: CPF Board.',
};

export const CATEGORIES = [
  { id: 'housing', label: 'Housing & utilities', color: '#0b6e4f' },
  { id: 'food', label: 'Food', color: '#b45309' },
  { id: 'transport', label: 'Transport', color: '#1d4ed8' },
  { id: 'health', label: 'Health', color: '#be185d' },
  { id: 'education', label: 'Education', color: '#6d28d9' },
  { id: 'recreation', label: 'Recreation', color: '#0e7490' },
  { id: 'infocomm', label: 'Information & communication', color: '#4d7c0f' },
  { id: 'clothing', label: 'Clothing & footwear', color: '#9f1239' },
  { id: 'insurance', label: 'Insurance', color: '#334155' },
  { id: 'others', label: 'Others', color: '#78716c' },
];

export function categoryById(id) {
  return CATEGORIES.find((c) => c.id === id) || { id, label: id, color: '#78716c' };
}

// Monthly budget targets for the Tan household, November 2026.
export const BUDGETS = {
  housing: 1800,
  food: 1100,
  transport: 600,
  health: 250,
  education: 1300,
  recreation: 250,
  infocomm: 120,
  clothing: 150,
  insurance: 510,
  others: 200,
};

// Every November 2026 transaction, in full. [day, description, category, $]
// November figures are shown to 26 November 2026.
export const NOVEMBER_TX = [
  [1, 'HDB mortgage — DBS GIRO', 'housing', 1320.0],
  [1, 'Life insurance premium', 'insurance', 320.0],
  [1, 'Home insurance (monthly share)', 'insurance', 38.0],
  [1, 'Mobile plans ×2 — Singtel', 'infocomm', 68.0],
  [1, 'Netflix subscription', 'infocomm', 16.98],
  [1, 'Tuition — Maths (elder child)', 'education', 280.0],
  [1, 'Student care fees', 'education', 180.0],
  [1, 'SimplyGo — MRT & bus top-up', 'transport', 128.0],
  [1, 'HDB season parking — November', 'transport', 110.0],
  [1, 'NTUC FairPrice — weekly groceries', 'food', 142.35],
  [2, 'SP Power — electricity & water', 'housing', 186.4],
  [2, 'Hawker lunch — chicken rice ×2', 'food', 18.5],
  [3, 'Town council service & conservancy', 'housing', 98.0],
  [3, 'Childcare fees (after subsidy)', 'education', 650.0],
  [3, 'Petrol — Shell', 'transport', 62.0],
  [4, 'Hawker dinner — char kway teow', 'food', 24.0],
  [5, 'Singtel fibre broadband', 'housing', 49.9],
  [5, 'Integrated Shield Plan top-up', 'insurance', 145.0],
  [5, 'GP clinic — child fever', 'health', 68.0],
  [6, 'Kopitiam breakfast — kaya toast set', 'food', 12.8],
  [6, 'Haircuts ×2', 'others', 42.0],
  [7, 'Grab — to clinic', 'transport', 18.4],
  [7, 'Cinema — family movie', 'recreation', 34.0],
  [8, 'NTUC FairPrice — weekly groceries', 'food', 118.6],
  [8, 'Piano enrichment', 'education', 120.0],
  [9, 'Hawker lunch — laksa', 'food', 16.4],
  [9, 'Guardian pharmacy — medicine', 'health', 42.5],
  [10, 'Petrol — Shell', 'transport', 58.5],
  [10, 'Child smartwatch top-up', 'infocomm', 15.0],
  [11, 'Food court dinner — mixed rice', 'food', 31.5],
  [12, 'Aircon servicing (4 units)', 'housing', 120.0],
  [12, 'ERP & car park charges', 'transport', 24.3],
  [13, 'Restaurant — family dinner', 'food', 86.0],
  [14, 'Dental check-up — scaling', 'health', 95.0],
  [14, 'Sentosa day trip — tickets', 'recreation', 96.0],
  [15, 'Sheng Siong — weekly groceries', 'food', 96.45],
  [15, 'Assessment books — Popular', 'education', 36.5],
  [15, 'Grab — to airport (visiting parents)', 'transport', 22.1],
  [16, 'Hawker lunch — wanton mee', 'food', 15.2],
  [16, 'Uniqlo — kids clothes', 'clothing', 89.9],
  [17, 'Petrol — Shell', 'transport', 61.2],
  [18, 'Coffee shop — kopi & breakfast', 'food', 11.6],
  [18, 'Birthday gift — nephew', 'others', 50.0],
  [19, 'Vitamins & supplements', 'health', 38.9],
  [20, 'Restaurant — birthday dinner', 'food', 128.0],
  [21, 'Swimming pool entry', 'recreation', 14.0],
  [22, 'NTUC FairPrice — weekly groceries', 'food', 131.2],
  [22, 'Books — Popular bookstore', 'recreation', 42.8],
  [23, 'Hawker dinner — satay & drinks', 'food', 27.3],
  [23, 'School shoes', 'clothing', 59.0],
  [24, 'Grab — late night home', 'transport', 15.6],
  [24, 'Household items — IKEA', 'others', 76.5],
  [25, 'Tampines wet market — fish & veg', 'food', 58.0],
  [25, 'Food court lunch — yong tau foo', 'food', 19.8],
  [25, 'Petrol — Shell', 'transport', 55.8],
  [26, 'NTUC FairPrice — weekly groceries', 'food', 104.75],
];

// Monthly category totals, June–October 2026, in CATEGORIES order.
// [housing, food, transport, health, education, recreation, infocomm,
//  clothing, insurance, others]
export const MONTHS = [
  { key: '2026-06', label: 'Jun 2026', totals: [1740, 1080, 590, 180, 1240, 240, 100, 60, 503, 150] },
  { key: '2026-07', label: 'Jul 2026', totals: [1760, 1120, 610, 320, 1260, 310, 100, 210, 503, 190] },
  { key: '2026-08', label: 'Aug 2026', totals: [1750, 1050, 540, 150, 1230, 180, 115, 40, 503, 120] },
  { key: '2026-09', label: 'Sep 2026', totals: [1780, 1150, 640, 410, 1290, 260, 100, 130, 503, 230] },
  { key: '2026-10', label: 'Oct 2026', totals: [1760, 1090, 580, 210, 1250, 220, 100, 85, 503, 175] },
];

export const MONTH_LABELS = {
  '2026-06': 'June 2026',
  '2026-07': 'July 2026',
  '2026-08': 'August 2026',
  '2026-09': 'September 2026',
  '2026-10': 'October 2026',
  '2026-11': 'November 2026',
};

// Savings goals. Saved amounts are as at 26 November 2026.
export const GOALS = [
  {
    id: 'emergency',
    name: 'Emergency fund',
    target: 35000,
    saved: 21400,
    note: 'Six months of spending — the standard cushion for a household with two young children.',
  },
  {
    id: 'japan',
    name: 'Japan family holiday — June 2027',
    target: 6000,
    saved: 3850,
    note: 'Flights, seven nights and spending money for four.',
  },
  {
    id: 'education',
    name: 'Children’s education fund',
    target: 12000,
    saved: 4200,
    note: 'Tuition and enrichment through primary school.',
  },
  {
    id: 'laptop',
    name: 'New laptop for home office',
    target: 1800,
    saved: 1200,
    note: 'Replacing the 2019 laptop before it fails.',
  },
];

// Bills due in December 2026.
export const BILLS = [
  { id: 'mortgage', due: '1 Dec', label: 'HDB mortgage — DBS GIRO', amount: 1320.0, auto: true },
  { id: 'life', due: '1 Dec', label: 'Life insurance premium', amount: 320.0, auto: true },
  { id: 'mobile', due: '1 Dec', label: 'Mobile plans ×2 — Singtel', amount: 68.0, auto: true },
  { id: 'childcare', due: '3 Dec', label: 'Childcare fees (after subsidy)', amount: 650.0, auto: true },
  { id: 'power', due: '5 Dec', label: 'SP Power — electricity & water (estimate)', amount: 190.0, auto: true },
  { id: 'council', due: '10 Dec', label: 'Town council service & conservancy', amount: 98.0, auto: false },
  { id: 'tuition', due: '15 Dec', label: 'Tuition — Maths (elder child)', amount: 280.0, auto: false },
  { id: 'netflix', due: '28 Dec', label: 'Netflix subscription', amount: 16.98, auto: true },
];

// ---------------------------------------------------------------------------
// National benchmarks — Department of Statistics, Household Expenditure
// Survey 2023 (published November 2024). Average monthly household
// expenditure by category, resident households. The category figures add
// to $7,119 a month including imputed rent of owner-occupied homes
// ($1,188); excluding it the total is $5,931. Shares below are of $7,119,
// as the survey's executive summary states them.
// ---------------------------------------------------------------------------

export const HES23 = {
  title: 'Household Expenditure Survey 2023',
  publisher: 'Department of Statistics, Singapore',
  published: 'November 2024',
  totalExImputed: 7119,
  totalExclImputed: 5931,
  imputedRent: 1188,
  incomeAllSources: 15473,
  incomeNote: 'Average monthly household income from all sources, 2023.',
  categories: [
    { id: 'housing', label: 'Housing & related expenditure', amount: 2122, share: 29.8 },
    { id: 'food', label: 'Food & food serving services', amount: 1422, share: 20.0 },
    { id: 'transport', label: 'Transport', amount: 951, share: 13.4 },
    { id: 'insurance', label: 'Insurance & financial services', amount: 590, share: 8.3 },
    { id: 'health', label: 'Health', amount: 474, share: 6.7 },
    { id: 'education', label: 'Education', amount: 404, share: 5.7 },
    { id: 'others', label: 'Others (incl. personal care)', amount: 350, share: 4.9 },
    { id: 'recreation', label: 'Recreation, sport & culture', amount: 335, share: 4.7 },
    { id: 'infocomm', label: 'Information & communication', amount: 270, share: 3.8 },
    { id: 'clothing', label: 'Clothing & footwear', amount: 120, share: 1.7 },
    { id: 'accommodation', label: 'Accommodation services', amount: 82, share: 1.2 },
  ],
  foodSplit: [
    { label: 'Food & non-alcoholic beverages (groceries)', amount: 456 },
    { label: 'Food & beverage serving services (eating out)', amount: 966 },
  ],
  byIncome: [
    { label: 'Lowest 20% of households', amount: 3233 },
    { label: 'HDB flats', amount: 4657 },
    { label: 'Condominiums & other apartments', amount: 9567 },
    { label: 'Landed properties', amount: 13545 },
  ],
  online: { amount: 707, share: 11.9, households: 82 },
  transfersPerMember: 6317,
};

export const SOURCES = [
  {
    key: 'HES23',
    publisher: 'Department of Statistics, Singapore',
    title: 'Report on the Household Expenditure Survey 2023 (November 2024)',
    note: 'Average monthly household expenditure $5,931 in 2023 (excluding imputed rent of owner-occupied homes; $7,119 including it), up from $5,163 in 2017/18. Average monthly household income from all sources $15,473. Housing 29.8%, food 20.0% and transport 13.4% of spending. Online spending averaged $707 a month (11.9% of spending); 82% of households bought online. Government transfers averaged $6,317 per household member a year.',
  },
  {
    key: 'MOM-I',
    publisher: 'Ministry of Manpower, Manpower Research and Statistics Department',
    title: 'Gross Monthly Income from Employment (Comprehensive Labour Force Survey)',
    note: 'Median gross monthly income from employment of full-time employed residents, including employer CPF contributions, mid-year: S$5,775 in June 2025 (S$5,500 in 2024).',
  },
  {
    key: 'CPI25',
    publisher: 'Monetary Authority of Singapore and Ministry of Trade and Industry',
    title: 'Consumer Price Developments (2025)',
    note: 'CPI-All Items inflation averaged 0.9% in 2025, down from 2.4% in 2024 and 6.1% in 2022. MAS Core Inflation averaged 0.7% in 2025.',
  },
  {
    key: 'CPF26',
    publisher: 'Central Provident Fund Board',
    title: 'CPF contribution rates',
    note: 'For employees aged 55 and below: employee 20% and employer 17% of ordinary wages, up to the $8,000 monthly ordinary wage ceiling.',
  },
  {
    key: 'GST24',
    publisher: 'Inland Revenue Authority of Singapore',
    title: 'GST rate',
    note: 'Goods and Services Tax is 9% from 1 January 2024 (8% in 2023, 7% before that).',
  },
];

export function sourceByKey(key) {
  return SOURCES.find((s) => s.key === key);
}
