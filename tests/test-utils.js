(function() {
  const results = document.getElementById('results');

  function assert(condition, msg) {
    const el = document.createElement('div');
    el.className = condition ? 'pass' : 'fail';
    el.textContent = (condition ? '✓ ' : '✗ ') + msg;
    results.appendChild(el);
    if (!condition) console.error('FAIL:', msg);
  }

  function addSuite(name) {
    const suite = document.createElement('div');
    suite.className = 'suite';
    suite.innerHTML = '<h3>' + name + '</h3>';
    results.appendChild(suite);
    return suite;
  }

  window.TestUtils = { assert, addSuite };
})();

// （接上文 test-utils.js）
(function() {
  var suite = TestUtils.addSuite('utils.js');
  var assert = TestUtils.assert;
  var BK = window.BK;

  // formatCurrency
  assert(BK.formatCurrency(35, 'expense') === '-35.00', 'formatCurrency: expense shows minus');
  assert(BK.formatCurrency(1000, 'income') === '+1000.00', 'formatCurrency: income shows plus');
  assert(BK.formatCurrency(0, 'expense') === '-0.00', 'formatCurrency: zero amount');

  // generateId
  var id1 = BK.generateId();
  var id2 = BK.generateId();
  assert(typeof id1 === 'string' && id1.length > 0, 'generateId: returns non-empty string');
  assert(id1 !== id2, 'generateId: generates unique IDs');

  // getMonthKey
  assert(BK.getMonthKey('2026-05-30') === '2026-05', 'getMonthKey: extracts month key');
  assert(BK.getMonthKey('2026-01-01') === '2026-01', 'getMonthKey: handles January');

  // getMonthRange
  var range = BK.getMonthRange('2026-05');
  assert(range.start === '2026-05-01', 'getMonthRange: start is first day');
  assert(range.end === '2026-05-31', 'getMonthRange: end is last day (May has 31)');

  var febRange = BK.getMonthRange('2026-02');
  assert(febRange.end === '2026-02-28', 'getMonthRange: handles February (non-leap)');

  // today
  var today = BK.today();
  assert(/^\d{4}-\d{2}-\d{2}$/.test(today), 'today: returns YYYY-MM-DD format');

  // currentMonth
  var cm = BK.currentMonth();
  assert(/^\d{4}-\d{2}$/.test(cm), 'currentMonth: returns YYYY-MM format');

  // formatDate
  assert(BK.formatDate('2026-05-30') === '5月30日', 'formatDate: formats correctly');
  assert(BK.formatDate('2026-12-01') === '12月1日', 'formatDate: handles single-digit day');
})();
