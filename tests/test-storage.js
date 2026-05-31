// tests/test-storage.js
(function() {
  var suite = TestUtils.addSuite('storage.js');
  var assert = TestUtils.assert;
  var BK = window.BK;

  // 清理
  BK.clearAll();

  // 初始状态
  var tx = BK.loadTransactions();
  assert(Array.isArray(tx) && tx.length === 0, 'loadTransactions: returns empty array when no data');

  var cat = BK.loadCategories();
  assert(Array.isArray(cat) && cat.length === 0, 'loadCategories: returns empty array when no data');

  // 保存和加载
  var sampleTx = [{ id: '1', type: 'expense', amount: 35, categoryId: 'food', note: '午餐', date: '2026-05-30' }];
  BK.saveTransactions(sampleTx);
  var loaded = BK.loadTransactions();
  assert(loaded.length === 1 && loaded[0].id === '1', 'saveTransactions/loadTransactions: round-trip works');

  var sampleCat = [{ id: 'food', name: '餐饮', icon: '🍔', type: 'expense', isPreset: true }];
  BK.saveCategories(sampleCat);
  var loadedCat = BK.loadCategories();
  assert(loadedCat.length === 1 && loadedCat[0].name === '餐饮', 'saveCategories/loadCategories: round-trip works');

  // 损坏数据处理
  localStorage.setItem('bk_transactions', 'not-valid-json');
  var corrupted = BK.loadTransactions();
  assert(Array.isArray(corrupted) && corrupted.length === 0, 'loadTransactions: handles corrupted data gracefully');

  // 清理
  BK.clearAll();
  assert(BK.loadTransactions().length === 0, 'clearAll: removes all data');
  assert(BK.loadCategories().length === 0, 'clearAll: removes category data');
})();
