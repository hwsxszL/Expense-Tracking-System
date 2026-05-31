// tests/test-categories.js
(function() {
  var suite = TestUtils.addSuite('categories.js');
  var assert = TestUtils.assert;
  var BK = window.BK;

  BK.clearAll();

  // createPresetCategories
  var presets = BK.createPresetCategories();
  assert(presets.length === 13, 'createPresetCategories: returns 13 presets (8 expense + 5 income)');
  var expensePresets = presets.filter(function(c) { return c.type === 'expense'; });
  assert(expensePresets.length === 8, 'createPresetCategories: 8 expense presets');
  var incomePresets = presets.filter(function(c) { return c.type === 'income'; });
  assert(incomePresets.length === 5, 'createPresetCategories: 5 income presets');
  assert(presets[0].isPreset === true, 'createPresetCategories: presets marked as isPreset');

  // initCategories
  BK.clearAll();
  var cats = BK.initCategories();
  assert(cats.length === 13, 'initCategories: initializes with presets when empty');
  var cats2 = BK.initCategories();
  assert(cats2.length === 13, 'initCategories: returns existing categories when not empty');

  // filterCategoriesByType
  var filtered = BK.filterCategoriesByType(cats, 'expense');
  assert(filtered.length === 8 && filtered.every(function(c) { return c.type === 'expense'; }),
    'filterCategoriesByType: filters expense categories');

  // findCategoryById
  var found = BK.findCategoryById(cats, 'preset_expense_0');
  assert(found !== null && found.name === '餐饮', 'findCategoryById: finds existing category');
  var notFound = BK.findCategoryById(cats, 'nonexistent');
  assert(notFound === null, 'findCategoryById: returns null for non-existent');

  // addCategory
  BK.clearAll();
  var cats3 = BK.initCategories();
  var beforeLen = cats3.length;
  BK.addCategory(cats3, { name: '宠物', icon: '🐱', type: 'expense' });
  assert(cats3.length === beforeLen + 1, 'addCategory: adds custom category');
  var added = cats3[cats3.length - 1];
  assert(added.name === '宠物' && added.isPreset === false, 'addCategory: custom category not preset');

  // updateCategory
  BK.updateCategory(cats3, added.id, { name: '宠物用品' });
  assert(added.name === '宠物用品', 'updateCategory: updates custom category name');
  BK.updateCategory(cats3, 'preset_expense_0', { name: '美食' });
  assert(BK.findCategoryById(cats3, 'preset_expense_0').name === '餐饮', 'updateCategory: cannot edit preset category');

  // deleteCategory with migration
  BK.clearAll();
  var cats4 = BK.initCategories();
  BK.clearAll();
  BK.saveCategories(cats4);
  BK.saveTransactions([
    { id: 'tx1', type: 'expense', amount: 50, categoryId: 'preset_expense_0', note: '', date: '2026-05-30', createdAt: '' }
  ]);

  var result1 = BK.deleteCategory(cats4, 'preset_expense_0', BK.loadTransactions());
  assert(cats4.length === 13, 'deleteCategory: cannot delete preset category');

  BK.addCategory(cats4, { name: '宠物', icon: '🐱', type: 'expense' });
  var customId = cats4[cats4.length - 1].id;
  // Link the transaction to the custom category before deleting it
  BK.saveTransactions([
    { id: 'tx1', type: 'expense', amount: 50, categoryId: customId, note: '', date: '2026-05-30', createdAt: '' }
  ]);
  var result = BK.deleteCategory(cats4, customId, BK.loadTransactions());
  assert(result.categories.length === 13, 'deleteCategory: removes custom category');
  var migratedTxs = BK.loadTransactions();
  var otherExpense = BK.findCategoryById(cats4, 'preset_expense_7');
  assert(migratedTxs[0].categoryId === otherExpense.id, 'deleteCategory: migrates transactions to fallback category');

  // validateCategoryName
  var v1 = BK.validateCategoryName(cats4, '', 'expense');
  assert(v1.valid === false, 'validateCategoryName: rejects empty name');
  var v2 = BK.validateCategoryName(cats4, '餐饮', 'expense');
  assert(v2.valid === false, 'validateCategoryName: rejects duplicate name');
  var v3 = BK.validateCategoryName(cats4, '新分类', 'expense');
  assert(v3.valid === true, 'validateCategoryName: accepts unique name');
})();
