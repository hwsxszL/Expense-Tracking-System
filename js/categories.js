// js/categories.js
window.BK = window.BK || {};

(function(ns) {
  ns.createPresetCategories = function() {
    var presetExpense = [
      { icon: '🍔', name: '餐饮' },
      { icon: '🚇', name: '交通' },
      { icon: '🛒', name: '购物' },
      { icon: '🏠', name: '住房' },
      { icon: '🎮', name: '娱乐' },
      { icon: '💊', name: '医疗' },
      { icon: '📚', name: '教育' },
      { icon: '✨', name: '其他支出' }
    ];
    var presetIncome = [
      { icon: '💰', name: '工资' },
      { icon: '🎁', name: '礼金' },
      { icon: '📈', name: '理财' },
      { icon: '💼', name: '兼职' },
      { icon: '✨', name: '其他收入' }
    ];

    var categories = [];
    presetExpense.forEach(function(p, i) {
      categories.push({ id: 'preset_expense_' + i, name: p.name, icon: p.icon, type: 'expense', isPreset: true });
    });
    presetIncome.forEach(function(p, i) {
      categories.push({ id: 'preset_income_' + i, name: p.name, icon: p.icon, type: 'income', isPreset: true });
    });
    return categories;
  };

  ns.initCategories = function() {
    var existing = ns.loadCategories();
    if (existing.length === 0) {
      var presets = ns.createPresetCategories();
      ns.saveCategories(presets);
      return presets;
    }
    return existing;
  };

  ns.filterCategoriesByType = function(categories, type) {
    return categories.filter(function(c) { return c.type === type; });
  };

  ns.findCategoryById = function(categories, id) {
    return categories.find(function(c) { return c.id === id; }) || null;
  };

  ns.addCategory = function(categories, newCat) {
    var category = {
      id: ns.generateId(),
      name: newCat.name.trim(),
      icon: newCat.icon || '✨',
      type: newCat.type,
      isPreset: false
    };
    categories.push(category);
    ns.saveCategories(categories);
    return categories;
  };

  ns.updateCategory = function(categories, id, updates) {
    var cat = ns.findCategoryById(categories, id);
    if (!cat || cat.isPreset) return categories;
    if (updates.name !== undefined) cat.name = updates.name.trim();
    if (updates.icon !== undefined) cat.icon = updates.icon;
    ns.saveCategories(categories);
    return categories;
  };

  ns.deleteCategory = function(categories, id, transactions) {
    var cat = ns.findCategoryById(categories, id);
    if (!cat || cat.isPreset) return { categories: categories, transactions: transactions };

    var fallback = categories.find(function(c) {
      return c.type === cat.type && c.name.indexOf('其他') === 0;
    }) || categories.find(function(c) {
      return c.type === cat.type;
    });

    var newCategories = categories.filter(function(c) { return c.id !== id; });
    var newTransactions = transactions.map(function(tx) {
      if (tx.categoryId === id && fallback) {
        return Object.assign({}, tx, { categoryId: fallback.id });
      }
      return tx;
    });

    ns.saveCategories(newCategories);
    ns.saveTransactions(newTransactions);
    return { categories: newCategories, transactions: newTransactions };
  };

  ns.validateCategoryName = function(categories, name, type, excludeId) {
    var trimmed = name.trim();
    if (!trimmed) return { valid: false, message: '分类名称不能为空' };
    var duplicate = categories.find(function(c) {
      return c.name === trimmed && c.type === type && c.id !== excludeId;
    });
    if (duplicate) return { valid: false, message: '已存在同名分类' };
    return { valid: true, message: '' };
  };
})(window.BK);
