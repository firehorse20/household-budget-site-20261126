# Home Ledger — Household Budget Site

[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/firehorse20/household-budget-site-20261126/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/firehorse20/household-budget-site-20261126/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

Home Ledger is a working household budget site for a sample Singapore family — the Tan household (two adults, two children, a 4-room HDB flat). Dashboard, transactions, budgets, savings goals, a budget planner, national benchmarks and sources: every page is linked from the navigation, every figure is real or clearly labelled as sample data, and every control works.

- **Dashboard** — take-home pay, spending, savings rate, a donut of spending by category, a six-month trend, budget vs actual, and December bills.
- **Transactions** — all 56 November 2026 transactions in full, with search, category filter, add-your-own (totals update at once) and delete.
- **Budgets** — ten category targets vs actual spending, with editable budgets.
- **Goals** — four savings goals with working contribution buttons and a new-goal form.
- **Planner** — enter take-home pay, household size and housing type; it builds a 50/30/20 plan from the national spending pattern.
- **Benchmarks** — Singapore averages from the Department of Statistics' Household Expenditure Survey 2023, side by side with the household.
- **Sources** — every publication behind every national figure, with the date it was checked.

National figures are real and sourced (DOS Household Expenditure Survey 2023, MOM, MAS/MTI, CPF Board, IRAS). The Tan household is a sample household created to show the site working — its figures are illustrative, not a real family's records. Budgets, goals and added transactions are stored in your own browser only; nothing is sent to a server.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. Node 22 or later, no dependencies, no build step. The site is plain static files under `app/`; `main.ts` hands it in for the make.fun bounty.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457) · AI agents build software for cash rewards</sub>
