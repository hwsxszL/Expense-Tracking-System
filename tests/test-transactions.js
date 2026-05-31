// tests/test-transactions.js
(function() {
  var suite = TestUtils.addSuite('transactions.js');
  var assert = TestUtils.assert;
  var BK = window.BK;

  BK.clearAll();
  var cats = BK.initCategories();
  var txs = [];

  // addTransaction
  txs = BK.addTransaction(txs, {
    type: 'expense', amount: 35, categoryId: 'preset_expense_0',
    note: '午餐', date: '2026-05-30'
  });
  assert(txs.length === 1, 'addTransaction: adds to array');
  assert(txs[0].amount === 35, 'addTransaction: stores correct amount');
  assert(txs[0].note === '午餐', 'addTransaction: stores note');
  assert(txs[0].id && txs[0].createdAt, 'addTransaction: generates id and createdAt');

  txs = BK.addTransaction(txs, {
    type: 'income', amount: 1000, categoryId: 'preset_income_0',
    note: '工资', date: '2026-05-29'
  });
  assert(txs.length === 2, 'addTransaction: adds multiple');

  // deleteTransaction
  // After addTransaction (uses unshift), the income is at index 0, expense at index 1.
  // Delete the income (index 0) to keep the expense for subsequent assertions.
  txs = BK.deleteTransaction(txs, txs[0].id);
  assert(txs.length === 1, 'deleteTransaction: removes by id');
  assert(txs[0].amount === 35, 'deleteTransaction: correct record remains');

  // filterByMonth
  txs = BK.addTransaction(txs, {
    type: 'expense', amount: 50, categoryId: 'preset_expense_1',
    note: '地铁', date: '2026-04-28'
  });
  var mayTxs = BK.filterByMonth(txs, '2026-05');
  assert(mayTxs.length === 1, 'filterByMonth: filters to specified month');
  var aprTxs = BK.filterByMonth(txs, '2026-04');
  assert(aprTxs.length === 1, 'filterByMonth: finds April records');

  // calculateStats
  var stats = BK.calculateStats(txs, cats, '2026-05');
  assert(stats.totalExpense === 35, 'calculateStats: correct total expense');
  assert(stats.totalIncome === 0, 'calculateStats: correct total income (after delete)');
  assert(stats.balance === -35, 'calculateStats: correct balance');
  assert(Array.isArray(stats.byCategory), 'calculateStats: returns byCategory array');

  // getAvailableMonths
  var months = BK.getAvailableMonths(txs);
  assert(months.length === 2, 'getAvailableMonths: returns 2 distinct months');
  assert(months[0] > months[1], 'getAvailableMonths: sorted descending');

  // getMonthlyTrend
  var trend = BK.getMonthlyTrend(txs, 6);
  assert(trend.length === 6, 'getMonthlyTrend: returns 6 months');
  assert(trend[0].month && trend[0].income !== undefined,
    'getMonthlyTrend: each entry has month, income, expense');
})();
