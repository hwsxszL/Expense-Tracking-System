// js/categories.js — 云存储版
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
    var hash = ns.getUserHash();
    presetExpense.forEach(function(p, i) {
      categories.push({ id: 'preset_expense_' + i, passphrase_hash: hash, name: p.name, icon: p.icon, type: 'expense', is_preset: true });
    });
    presetIncome.forEach(function(p, i) {
      categories.push({ id: 'preset_income_' + i, passphrase_hash: hash, name: p.name, icon: p.icon, type: 'income', is_preset: true });
    });
    return categories;
  };

  ns.initCategories = async function() {
    var existing = await ns.loadCategories();
    if (existing.length === 0) {
      var presets = ns.createPresetCategories();
      await ns.insertCategoriesBatch(presets);
      return presets;
    }
    // 转换字段名：Supabase 用 snake_case，JS 用 camelCase
    return existing.map(function(c) { return normalizeCat(c); });
  };

  ns.filterCategoriesByType = function(categories, type) {
    return categories.filter(function(c) { return c.type === type; });
  };

  ns.findCategoryById = function(categories, id) {
    return categories.find(function(c) { return c.id === id; }) || null;
  };

  ns.addCategory = async function(categories, newCat) {
    var hash = ns.getUserHash();
    var category = {
      id: ns.generateId(),
      passphrase_hash: hash,
      name: newCat.name.trim(),
      icon: newCat.icon || '✨',
      type: newCat.type,
      is_preset: false
    };
    await ns.insertCategory(category);
    categories.push(normalizeCat(category));
    return categories;
  };

  ns.updateCategory = async function(categories, id, updates) {
    var cat = ns.findCategoryById(categories, id);
    if (!cat || cat.isPreset) return categories;
    if (updates.name !== undefined) cat.name = updates.name.trim();
    if (updates.icon !== undefined) cat.icon = updates.icon;
    await ns.updateCategoryRecord(id, { name: cat.name, icon: cat.icon });
    return categories;
  };

  ns.deleteCategory = async function(categories, id, transactions) {
    var cat = ns.findCategoryById(categories, id);
    if (!cat || cat.isPreset) return { categories: categories, transactions: transactions };

    var fallback = categories.find(function(c) {
      return c.type === cat.type && c.name.indexOf('其他') === 0;
    }) || categories.find(function(c) {
      return c.type === cat.type;
    });

    // 先迁移 Supabase 中的记录
    if (fallback) {
      await ns.migrateTransactionsCategory(id, fallback.id);
    }

    // 删除 Supabase 中的分类
    await ns.deleteCategoryRecord(id);

    // 更新本地数组
    var newCategories = categories.filter(function(c) { return c.id !== id; });
    var newTransactions = transactions.map(function(tx) {
      if (tx.categoryId === id && fallback) {
        tx.categoryId = fallback.id;
      }
      return tx;
    });

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

  // Supabase 用 snake_case，前端用 camelCase
  function normalizeCat(c) {
    return {
      id: c.id,
      name: c.name,
      icon: c.icon,
      type: c.type,
      isPreset: c.is_preset,
      passphrase_hash: c.passphrase_hash
    };
  }
})(window.BK);
