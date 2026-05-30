# 记账小系统 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 构建一个纯前端 + localStorage 的轻量级个人记账 Web 应用，支持收支录入和分类统计。

**架构：** Vanilla JS（无框架），命名空间模式组织模块，双 Tab 页面（记账/统计），Chart.js CDN 图表。Storage 层负责持久化，Logic 层处理业务逻辑，UI 层渲染 DOM。

**技术栈：** Vanilla JS (IIFE + 命名空间 `window.BK`)，纯 CSS + CSS 变量，Chart.js 4.x CDN，localStorage

---

## 文件结构

| 文件 | 职责 |
|------|------|
| `index.html` | 应用入口，双 Tab 骨架，引入所有 JS/CSS |
| `css/style.css` | 全局样式，CSS 变量，布局，组件样式 |
| `js/utils.js` | 工具函数：格式化金额/日期、生成 ID、月份工具 |
| `js/storage.js` | localStorage 读写封装（transactions、categories） |
| `js/categories.js` | 分类业务逻辑：预设、CRUD、类型过滤 |
| `js/transactions.js` | 交易记录业务逻辑：CRUD、月份筛选、统计计算 |
| `js/ui/record.js` | 记账页 UI：表单渲染、列表渲染、事件绑定 |
| `js/ui/stats.js` | 统计页 UI：概览卡片、Chart.js 图表、分类排行 |
| `js/ui/category-manager.js` | 分类管理弹窗：添加、编辑、删除分类 |
| `js/app.js` | 应用入口：初始化、Tab 切换、模块协调 |
| `tests/test.html` | 测试运行页面，加载所有测试文件 |
| `tests/test-utils.js` | utils.js 的单元测试 |
| `tests/test-storage.js` | storage.js 的单元测试 |
| `tests/test-categories.js` | categories.js 的单元测试 |
| `tests/test-transactions.js` | transactions.js 的单元测试 |
| `README.md` | 项目说明 |

---

### 任务 1：项目骨架搭建

**文件：**
- 创建：`index.html`、`css/style.css`

- [ ] **步骤 1：创建 index.html 骨架**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>记账小系统</title>
  <link rel="stylesheet" href="css/style.css">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
</head>
<body>
  <div id="app">
    <nav class="tab-bar">
      <button class="tab-btn active" data-tab="record">记账</button>
      <button class="tab-btn" data-tab="stats">统计</button>
    </nav>
    <main id="main-content"></main>
  </div>

  <script src="js/utils.js"></script>
  <script src="js/storage.js"></script>
  <script src="js/categories.js"></script>
  <script src="js/transactions.js"></script>
  <script src="js/ui/record.js"></script>
  <script src="js/ui/stats.js"></script>
  <script src="js/ui/category-manager.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
```

- [ ] **步骤 2：创建 CSS 基础变量和布局**

```css
/* css/style.css */
:root {
  --color-income: #2ecc71;
  --color-expense: #e74c3c;
  --color-balance: #1976d2;
  --color-bg: #f5f6fa;
  --color-card: #ffffff;
  --color-text: #2c3e50;
  --color-subtext: #7f8c8d;
  --color-border: #ecf0f1;
  --color-primary: #3498db;
  --radius: 8px;
  --shadow: 0 1px 3px rgba(0,0,0,0.08);
  --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: var(--font);
  background: var(--color-bg);
  color: var(--color-text);
  min-height: 100vh;
}

#app {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
}

/* Tab 导航 */
.tab-bar {
  display: flex;
  gap: 0;
  margin-bottom: 20px;
  background: var(--color-card);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow);
}

.tab-btn {
  flex: 1;
  padding: 12px 24px;
  border: none;
  background: transparent;
  font-size: 16px;
  cursor: pointer;
  color: var(--color-subtext);
  transition: all 0.2s;
  border-bottom: 3px solid transparent;
}

.tab-btn.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
  font-weight: 600;
}

/* 卡片 */
.card {
  background: var(--color-card);
  border-radius: var(--radius);
  padding: 16px;
  box-shadow: var(--shadow);
}

/* 按钮 */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: opacity 0.2s;
}

.btn:hover { opacity: 0.85; }

.btn-primary {
  background: var(--color-primary);
  color: #fff;
}

.btn-danger {
  background: transparent;
  color: var(--color-expense);
  border: 1px solid var(--color-expense);
}

.btn-small {
  padding: 4px 10px;
  font-size: 12px;
}

/* 表单 */
.form-group {
  margin-bottom: 12px;
}

.form-group label {
  display: block;
  font-size: 13px;
  color: var(--color-subtext);
  margin-bottom: 4px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  border-color: var(--color-primary);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--color-subtext);
}

.empty-state .icon {
  font-size: 48px;
  margin-bottom: 12px;
}

/* 表格 */
.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
  font-size: 13px;
}

.data-table th {
  color: var(--color-subtext);
  font-weight: 500;
  background: #fafbfc;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: var(--color-card);
  border-radius: 12px;
  padding: 24px;
  width: 480px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 8px 30px rgba(0,0,0,0.15);
}

.modal h3 {
  margin-bottom: 16px;
}

.modal-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 16px;
}

/* 工具类 */
.hidden { display: none !important; }

.text-income { color: var(--color-income); }
.text-expense { color: var(--color-expense); }

.mr-8 { margin-right: 8px; }
.mb-16 { margin-bottom: 16px; }
```

- [ ] **步骤 3：在浏览器中打开 index.html 验证骨架**

打开 `index.html`，确认页面显示两个 Tab 按钮（记账/统计），无控制台错误。

- [ ] **步骤 4：Commit**

```bash
git add index.html css/style.css
git commit -m "feat: add project skeleton with tab navigation and CSS base"
```

---

### 任务 2：工具函数模块（utils.js）

**文件：**
- 创建：`js/utils.js`、`tests/test-utils.js`、`tests/test.html`

- [ ] **步骤 1：先创建测试运行页面**

```html
<!-- tests/test.html -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>记账系统 - 测试</title>
  <style>
    body { font-family: monospace; max-width: 800px; margin: 20px auto; }
    .pass { color: #2ecc71; } .fail { color: #e74c3c; }
    .suite { margin-bottom: 16px; }
    .suite h3 { border-bottom: 1px solid #ccc; padding-bottom: 4px; }
  </style>
</head>
<body>
  <h2>测试结果</h2>
  <div id="results"></div>
  <script src="../js/utils.js"></script>
  <script src="../js/storage.js"></script>
  <script src="../js/categories.js"></script>
  <script src="../js/transactions.js"></script>
  <script src="test-utils.js"></script>
  <script src="test-storage.js"></script>
  <script src="test-categories.js"></script>
  <script src="test-transactions.js"></script>
</body>
</html>
```

- [ ] **步骤 2：编写 utils.js 测试（先写测试）**

```javascript
// tests/test-utils.js
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
```

- [ ] **步骤 3：编写 utils.js 实现代码**

```javascript
// js/utils.js
window.BK = window.BK || {};

(function(ns) {
  /**
   * 格式化金额显示
   * @param {number} amount - 正数金额
   * @param {'income'|'expense'} type
   * @returns {string} 如 "+35.00" 或 "-35.00"
   */
  ns.formatCurrency = function(amount, type) {
    const fixed = Math.abs(amount).toFixed(2);
    return type === 'income' ? '+' + fixed : '-' + fixed;
  };

  /**
   * 生成唯一 ID
   * @returns {string}
   */
  ns.generateId = function() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  };

  /**
   * 从日期字符串提取月份键 "YYYY-MM"
   * @param {string} dateStr - "YYYY-MM-DD"
   * @returns {string}
   */
  ns.getMonthKey = function(dateStr) {
    return dateStr.slice(0, 7);
  };

  /**
   * 获取指定月份的第一天和最后一天
   * @param {string} monthKey - "YYYY-MM"
   * @returns {{start: string, end: string}}
   */
  ns.getMonthRange = function(monthKey) {
    const [y, m] = monthKey.split('-').map(Number);
    const start = monthKey + '-01';
    const lastDay = new Date(y, m, 0).getDate(); // m is 1-based, day 0 = last day of prev month
    const end = monthKey + '-' + String(lastDay).padStart(2, '0');
    return { start, end };
  };

  /**
   * 获取当前日期字符串 "YYYY-MM-DD"
   * @returns {string}
   */
  ns.today = function() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  };

  /**
   * 获取当前月份键
   * @returns {string}
   */
  ns.currentMonth = function() {
    return ns.getMonthKey(ns.today());
  };

  /**
   * 格式化日期为显示文本
   * @param {string} dateStr - "YYYY-MM-DD"
   * @returns {string} 如 "5月30日"
   */
  ns.formatDate = function(dateStr) {
    const parts = dateStr.split('-');
    return parseInt(parts[1]) + '月' + parseInt(parts[2]) + '日';
  };
})(window.BK);
```

- [ ] **步骤 4：编写 utils.js 测试用例**

在 `tests/test-utils.js` 末尾追加：

```javascript
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
```

- [ ] **步骤 5：运行测试验证通过**

在浏览器中打开 `tests/test.html`，确认所有 utils.js 测试显示 ✓ 绿色通过。

- [ ] **步骤 6：Commit**

```bash
git add js/utils.js tests/test.html tests/test-utils.js
git commit -m "feat: add utils module with formatting and date helpers"
```

---

### 任务 3：存储层模块（storage.js）

**文件：**
- 创建：`js/storage.js`、`tests/test-storage.js`

- [ ] **步骤 1：编写 storage.js 实现**

```javascript
// js/storage.js
window.BK = window.BK || {};

(function(ns) {
  var TX_KEY = 'bk_transactions';
  var CAT_KEY = 'bk_categories';

  /**
   * 加载交易记录
   * @returns {Array}
   */
  ns.loadTransactions = function() {
    try {
      var data = localStorage.getItem(TX_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  };

  /**
   * 保存交易记录
   * @param {Array} transactions
   */
  ns.saveTransactions = function(transactions) {
    localStorage.setItem(TX_KEY, JSON.stringify(transactions));
  };

  /**
   * 加载分类
   * @returns {Array}
   */
  ns.loadCategories = function() {
    try {
      var data = localStorage.getItem(CAT_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  };

  /**
   * 保存分类
   * @param {Array} categories
   */
  ns.saveCategories = function(categories) {
    localStorage.setItem(CAT_KEY, JSON.stringify(categories));
  };

  /**
   * 清空所有数据（调试用）
   */
  ns.clearAll = function() {
    localStorage.removeItem(TX_KEY);
    localStorage.removeItem(CAT_KEY);
  };
})(window.BK);
```

- [ ] **步骤 2：编写 storage.js 测试**

```javascript
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
```

- [ ] **步骤 3：运行测试验证通过**

在浏览器中打开 `tests/test.html`，确认所有 storage.js 测试通过。

- [ ] **步骤 4：Commit**

```bash
git add js/storage.js tests/test-storage.js
git commit -m "feat: add storage layer with localStorage CRUD"
```

---

### 任务 4：分类管理逻辑（categories.js）

**文件：**
- 创建：`js/categories.js`、`tests/test-categories.js`

- [ ] **步骤 1：编写 categories.js 实现**

```javascript
// js/categories.js
window.BK = window.BK || {};

(function(ns) {
  /**
   * 创建预设分类列表
   * @returns {Array<Category>}
   */
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

  /**
   * 初始化分类：首次使用时写入预设，否则返回已有
   * @returns {Array<Category>}
   */
  ns.initCategories = function() {
    var existing = ns.loadCategories();
    if (existing.length === 0) {
      var presets = ns.createPresetCategories();
      ns.saveCategories(presets);
      return presets;
    }
    return existing;
  };

  /**
   * 按类型过滤分类
   * @param {Array<Category>} categories
   * @param {'expense'|'income'} type
   * @returns {Array<Category>}
   */
  ns.filterCategoriesByType = function(categories, type) {
    return categories.filter(function(c) { return c.type === type; });
  };

  /**
   * 根据 ID 查找分类
   * @param {Array<Category>} categories
   * @param {string} id
   * @returns {Category|null}
   */
  ns.findCategoryById = function(categories, id) {
    return categories.find(function(c) { return c.id === id; }) || null;
  };

  /**
   * 添加自定义分类
   * @param {Array<Category>} categories
   * @param {{name: string, icon: string, type: string}} newCat
   * @returns {Array<Category>} 更新后的分类数组
   */
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

  /**
   * 编辑自定义分类（预设分类不可编辑）
   * @param {Array<Category>} categories
   * @param {string} id
   * @param {{name?: string, icon?: string}} updates
   * @returns {Array<Category>}
   */
  ns.updateCategory = function(categories, id, updates) {
    var cat = ns.findCategoryById(categories, id);
    if (!cat || cat.isPreset) return categories;
    if (updates.name !== undefined) cat.name = updates.name.trim();
    if (updates.icon !== undefined) cat.icon = updates.icon;
    ns.saveCategories(categories);
    return categories;
  };

  /**
   * 删除自定义分类，将该分类下的记录迁移到同类型的"其他"分类
   * @param {Array<Category>} categories
   * @param {string} id
   * @param {Array<Transaction>} transactions
   * @returns {{categories: Array, transactions: Array}}
   */
  ns.deleteCategory = function(categories, id, transactions) {
    var cat = ns.findCategoryById(categories, id);
    if (!cat || cat.isPreset) return { categories: categories, transactions: transactions };

    // 找到同类型的"其他"分类作为迁移目标
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

  /**
   * 验证分类名称（不能为空，不能与同类型已有分类重名）
   * @param {Array<Category>} categories
   * @param {string} name
   * @param {string} type
   * @param {string} [excludeId] - 编辑时排除自身
   * @returns {{valid: boolean, message: string}}
   */
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
```

- [ ] **步骤 2：编写 categories.js 测试**

```javascript
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
  // 预设不可编辑
  BK.updateCategory(cats3, 'preset_expense_0', { name: '美食' });
  assert(BK.findCategoryById(cats3, 'preset_expense_0').name === '餐饮', 'updateCategory: cannot edit preset category');

  // deleteCategory with migration
  BK.clearAll();
  var cats4 = BK.initCategories();
  BK.clearAll(); // also clear transactions
  BK.saveCategories(cats4);
  BK.saveTransactions([
    { id: 'tx1', type: 'expense', amount: 50, categoryId: 'preset_expense_0', note: '', date: '2026-05-30', createdAt: '' }
  ]);

  // Can't delete preset
  var result1 = BK.deleteCategory(cats4, 'preset_expense_0', BK.loadTransactions());
  assert(cats4.length === 13, 'deleteCategory: cannot delete preset category');

  // Add and delete custom category
  BK.addCategory(cats4, { name: '宠物', icon: '🐱', type: 'expense' });
  var customId = cats4[cats4.length - 1].id;
  var result = BK.deleteCategory(cats4, customId, BK.loadTransactions());
  assert(result.categories.length === 13, 'deleteCategory: removes custom category');
  // Transactions migrated to "其他支出"
  var migratedTxs = BK.loadTransactions();
  var otherExpense = BK.findCategoryById(cats4, 'preset_expense_7'); // 其他支出
  assert(migratedTxs[0].categoryId === otherExpense.id, 'deleteCategory: migrates transactions to fallback category');

  // validateCategoryName
  var v1 = BK.validateCategoryName(cats4, '', 'expense');
  assert(v1.valid === false, 'validateCategoryName: rejects empty name');
  var v2 = BK.validateCategoryName(cats4, '餐饮', 'expense');
  assert(v2.valid === false, 'validateCategoryName: rejects duplicate name');
  var v3 = BK.validateCategoryName(cats4, '新分类', 'expense');
  assert(v3.valid === true, 'validateCategoryName: accepts unique name');
})();
```

- [ ] **步骤 3：运行测试验证通过**

在浏览器中打开 `tests/test.html`，确认所有 categories.js 测试通过。

- [ ] **步骤 4：Commit**

```bash
git add js/categories.js tests/test-categories.js
git commit -m "feat: add category management logic with preset and custom categories"
```

---

### 任务 5：交易记录逻辑（transactions.js）

**文件：**
- 创建：`js/transactions.js`、`tests/test-transactions.js`

- [ ] **步骤 1：编写 transactions.js 实现**

```javascript
// js/transactions.js
window.BK = window.BK || {};

(function(ns) {
  /**
   * 添加一条交易记录
   * @param {Array<Transaction>} transactions
   * @param {{type: string, amount: number, categoryId: string, note: string, date: string}} data
   * @returns {Array<Transaction>}
   */
  ns.addTransaction = function(transactions, data) {
    var tx = {
      id: ns.generateId(),
      type: data.type,
      amount: Number(data.amount),
      categoryId: data.categoryId,
      note: data.note || '',
      date: data.date,
      createdAt: new Date().toISOString()
    };
    transactions.unshift(tx);
    ns.saveTransactions(transactions);
    return transactions;
  };

  /**
   * 删除一条交易记录
   * @param {Array<Transaction>} transactions
   * @param {string} id
   * @returns {Array<Transaction>}
   */
  ns.deleteTransaction = function(transactions, id) {
    var filtered = transactions.filter(function(tx) { return tx.id !== id; });
    ns.saveTransactions(filtered);
    return filtered;
  };

  /**
   * 获取所有记录（按日期降序）
   * @param {Array<Transaction>} transactions
   * @returns {Array<Transaction>}
   */
  ns.getAllTransactions = function(transactions) {
    return transactions.slice().sort(function(a, b) {
      return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
    });
  };

  /**
   * 按月份筛选交易记录
   * @param {Array<Transaction>} transactions
   * @param {string} monthKey - "YYYY-MM"
   * @returns {Array<Transaction>}
   */
  ns.filterByMonth = function(transactions, monthKey) {
    return transactions.filter(function(tx) {
      return ns.getMonthKey(tx.date) === monthKey;
    });
  };

  /**
   * 计算月度统计
   * @param {Array<Transaction>} transactions
   * @param {Array<Category>} categories
   * @param {string} monthKey
   * @returns {{totalIncome: number, totalExpense: number, balance: number, byCategory: Array}}
   */
  ns.calculateStats = function(transactions, categories, monthKey) {
    var monthTxs = ns.filterByMonth(transactions, monthKey);
    var totalIncome = 0;
    var totalExpense = 0;
    var categoryMap = {};

    monthTxs.forEach(function(tx) {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else {
        totalExpense += tx.amount;
      }

      var key = tx.categoryId;
      if (!categoryMap[key]) {
        var cat = ns.findCategoryById(categories, key);
        categoryMap[key] = {
          categoryId: key,
          categoryName: cat ? cat.name : '未知',
          categoryIcon: cat ? cat.icon : '❓',
          type: tx.type,
          total: 0,
          count: 0
        };
      }
      categoryMap[key].total += tx.amount;
      categoryMap[key].count += 1;
    });

    var byCategory = Object.values(categoryMap).sort(function(a, b) {
      return b.total - a.total;
    });

    return {
      totalIncome: totalIncome,
      totalExpense: totalExpense,
      balance: totalIncome - totalExpense,
      byCategory: byCategory
    };
  };

  /**
   * 获取所有存在记录的月份列表（用于统计页月份选择器）
   * @param {Array<Transaction>} transactions
   * @returns {Array<string>} monthKeys 降序
   */
  ns.getAvailableMonths = function(transactions) {
    var months = {};
    transactions.forEach(function(tx) {
      var key = ns.getMonthKey(tx.date);
      months[key] = true;
    });
    return Object.keys(months).sort().reverse();
  };

  /**
   * 获取最近 N 个月的月度汇总（用于趋势图）
   * @param {Array<Transaction>} transactions
   * @param {number} n - 月数
   * @returns {Array<{month: string, income: number, expense: number}>}
   */
  ns.getMonthlyTrend = function(transactions, n) {
    n = n || 6;
    var result = [];
    var now = new Date();
    var currentMonth = ns.currentMonth();

    for (var i = n - 1; i >= 0; i--) {
      var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      var y = d.getFullYear();
      var m = String(d.getMonth() + 1).padStart(2, '0');
      var key = y + '-' + m;
      var monthTxs = ns.filterByMonth(transactions, key);
      var income = 0;
      var expense = 0;
      monthTxs.forEach(function(tx) {
        if (tx.type === 'income') income += tx.amount;
        else expense += tx.amount;
      });
      result.push({ month: m + '月', income: income, expense: expense });
    }
    return result;
  };
})(window.BK);
```

- [ ] **步骤 2：编写 transactions.js 测试**

```javascript
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
  txs = BK.deleteTransaction(txs, txs[1].id);
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
```

- [ ] **步骤 3：运行测试验证通过**

在浏览器中打开 `tests/test.html`，确认所有 transactions.js 测试通过。

- [ ] **步骤 4：Commit**

```bash
git add js/transactions.js tests/test-transactions.js
git commit -m "feat: add transaction CRUD, filtering, and statistics logic"
```

---

### 任务 6：记账页 UI（record.js）

**文件：**
- 创建：`js/ui/record.js`

此任务无独立测试文件——逻辑已在上层测试覆盖，UI 通过浏览器手动验证。

- [ ] **步骤 1：编写记账页 UI 模块**

```javascript
// js/ui/record.js
window.BK = window.BK || {};
window.BK.ui = window.BK.ui || {};

(function(ui) {
  var BK = window.BK;

  /**
   * 渲染记账页
   * @param {HTMLElement} container
   * @param {Array<Transaction>} transactions
   * @param {Array<Category>} categories
   */
  ui.renderRecordTab = function(container, transactions, categories) {
    var cats = categories || [];
    var expenseCats = BK.filterCategoriesByType(cats, 'expense');
    var incomeCats = BK.filterCategoriesByType(cats, 'income');

    container.innerHTML = '' +
      '<div class="record-layout">' +
      // 左侧表单
      '  <div class="record-form card">' +
      '    <h3>记一笔</h3>' +
      '    <div class="form-group">' +
      '      <label>类型</label>' +
      '      <div class="type-toggle">' +
      '        <button class="btn type-btn active" data-type="expense">支出</button>' +
      '        <button class="btn type-btn" data-type="income">收入</button>' +
      '      </div>' +
      '    </div>' +
      '    <div class="form-group">' +
      '      <label for="tx-amount">金额</label>' +
      '      <input type="number" id="tx-amount" placeholder="0.00" min="0.01" step="0.01" autofocus>' +
      '    </div>' +
      '    <div class="form-group">' +
      '      <label for="tx-category">分类</label>' +
      '      <select id="tx-category">' +
             renderCategoryOptions(expenseCats) +
      '      </select>' +
      '    </div>' +
      '    <div class="form-group">' +
      '      <label for="tx-date">日期</label>' +
      '      <input type="date" id="tx-date" value="' + BK.today() + '">' +
      '    </div>' +
      '    <div class="form-group">' +
      '      <label for="tx-note">备注（可选）</label>' +
      '      <input type="text" id="tx-note" placeholder="如：午餐" maxlength="100">' +
      '    </div>' +
      '    <button class="btn btn-primary" id="btn-submit" style="width:100%;padding:10px;">记一笔</button>' +
      '    <button class="btn btn-small" id="btn-manage-cat" style="margin-top:8px;width:100%;color:var(--color-subtext);">管理分类</button>' +
      '  </div>' +
      // 右侧列表
      '  <div class="record-list card">' +
      '    <h3 class="mb-16">流水记录</h3>' +
             renderTransactionList(transactions, cats) +
      '  </div>' +
      '</div>';

    // 绑定事件
    bindFormEvents(container, transactions, categories);
  };

  function renderCategoryOptions(categories) {
    return categories.map(function(c) {
      return '<option value="' + c.id + '">' + c.icon + ' ' + c.name + '</option>';
    }).join('');
  }

  function renderTransactionList(transactions, categories) {
    if (!transactions || transactions.length === 0) {
      return '<div class="empty-state">' +
        '<div class="icon">📝</div>' +
        '<p>还没有记录，记下第一笔吧！</p>' +
        '</div>';
    }

    var sorted = BK.getAllTransactions(transactions);
    return '<table class="data-table">' +
      '<thead><tr><th>日期</th><th>类别</th><th>备注</th><th style="text-align:right;">金额</th><th></th></tr></thead>' +
      '<tbody>' +
      sorted.map(function(tx) {
        var cat = BK.findCategoryById(categories, tx.categoryId);
        var colorClass = tx.type === 'income' ? 'text-income' : 'text-expense';
        return '<tr>' +
          '<td>' + BK.formatDate(tx.date) + '</td>' +
          '<td>' + (cat ? cat.icon + ' ' + cat.name : '未知') + '</td>' +
          '<td>' + escapeHtml(tx.note || '-') + '</td>' +
          '<td class="' + colorClass + '" style="text-align:right;">' + BK.formatCurrency(tx.amount, tx.type) + '</td>' +
          '<td><button class="btn btn-danger btn-small btn-delete" data-id="' + tx.id + '">删除</button></td>' +
          '</tr>';
      }).join('') +
      '</tbody></table>';
  }

  function bindFormEvents(container, transactions, categories) {
    var typeBtns = container.querySelectorAll('.type-btn');
    var categorySelect = container.querySelector('#tx-category');
    var submitBtn = container.querySelector('#btn-submit');
    var manageCatBtn = container.querySelector('#btn-manage-cat');
    var currentType = 'expense';

    // 类型切换
    typeBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        typeBtns.forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentType = btn.dataset.type;
        var cats = BK.filterCategoriesByType(categories, currentType);
        categorySelect.innerHTML = renderCategoryOptions(cats);
      });
    });

    // 提交
    submitBtn.addEventListener('click', function() {
      var amountEl = container.querySelector('#tx-amount');
      var amount = parseFloat(amountEl.value);
      if (isNaN(amount) || amount <= 0) {
        alert('请输入有效的金额');
        amountEl.focus();
        return;
      }

      var categoryId = categorySelect.value;
      if (!categoryId) {
        alert('请选择分类');
        return;
      }

      var date = container.querySelector('#tx-date').value;
      var note = container.querySelector('#tx-note').value.trim();

      BK.addTransaction(transactions, {
        type: currentType,
        amount: amount,
        categoryId: categoryId,
        note: note,
        date: date
      });

      // 清空表单
      amountEl.value = '';
      container.querySelector('#tx-note').value = '';
      amountEl.focus();

      // 重新渲染
      ui.renderRecordTab(container, transactions, categories);
    });

    // 删除按钮（事件委托）
    container.addEventListener('click', function(e) {
      if (e.target.classList.contains('btn-delete')) {
        var id = e.target.dataset.id;
        BK.deleteTransaction(transactions, id);
        ui.renderRecordTab(container, transactions, categories);
      }
    });

    // 管理分类按钮
    manageCatBtn.addEventListener('click', function() {
      if (typeof BK.ui.showCategoryManager === 'function') {
        BK.ui.showCategoryManager(categories, transactions, function() {
          ui.renderRecordTab(container, transactions, categories);
        });
      }
    });

    // 回车提交
    container.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        submitBtn.click();
      }
    });
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
})(window.BK.ui);
```

- [ ] **步骤 2：更新 CSS 添加记账页布局样式**

在 `css/style.css` 末尾追加：

```css
/* 记账页布局 */
.record-layout {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.record-form {
  flex: 0 0 300px;
}

.record-form h3 {
  margin-bottom: 16px;
}

.record-list {
  flex: 1;
  min-height: 400px;
}

.record-list h3 {
  margin-bottom: 0;
}

/* 类型切换按钮 */
.type-toggle {
  display: flex;
  gap: 0;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  overflow: hidden;
}

.type-btn {
  flex: 1;
  padding: 8px 0;
  border: none;
  background: transparent;
  font-size: 14px;
  cursor: pointer;
  color: var(--color-subtext);
  transition: all 0.2s;
}

.type-btn.active[data-type="expense"] {
  background: var(--color-expense);
  color: #fff;
}

.type-btn.active[data-type="income"] {
  background: var(--color-income);
  color: #fff;
}
```

- [ ] **步骤 3：编写 app.js 骨架验证记账页渲染**

```javascript
// js/app.js
window.BK = window.BK || {};

(function() {
  var BK = window.BK;
  var currentTab = 'record';
  var categories = [];
  var transactions = [];
  var mainContent = document.getElementById('main-content');

  function init() {
    categories = BK.initCategories();
    transactions = BK.loadTransactions();
    switchTab('record');

    // Tab 点击事件
    document.querySelectorAll('.tab-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        switchTab(this.dataset.tab);
      });
    });
  }

  function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    if (tab === 'record') {
      BK.ui.renderRecordTab(mainContent, transactions, categories);
    } else if (tab === 'stats') {
      // 待实现
      mainContent.innerHTML = '<div class="empty-state"><div class="icon">📊</div><p>统计功能即将上线</p></div>';
    }
  }

  // 暴露到全局供 UI 模块回调使用
  window.BK.refreshUI = function() {
    transactions = BK.loadTransactions();
    categories = BK.loadCategories();
    switchTab(currentTab);
  };

  init();
})();
```

- [ ] **步骤 4：在浏览器中手动验证**

打开 `index.html`：
- 确认记账页显示左侧表单 + 右侧空状态
- 填写金额、选择分类，点击"记一笔"
- 确认记录出现在右侧列表中
- 切换收入/支出类型，确认分类选项变化
- 点击删除按钮，确认记录消失
- 刷新页面，确认数据持久化

- [ ] **步骤 5：Commit**

```bash
git add js/ui/record.js css/style.css js/app.js
git commit -m "feat: add record tab UI with form and transaction list"
```

---

### 任务 7：分类管理弹窗 UI（category-manager.js）

**文件：**
- 创建：`js/ui/category-manager.js`

- [ ] **步骤 1：编写分类管理弹窗**

```javascript
// js/ui/category-manager.js
window.BK = window.BK || {};
window.BK.ui = window.BK.ui || {};

(function(ui) {
  var BK = window.BK;

  /**
   * 显示分类管理弹窗
   * @param {Array<Category>} categories
   * @param {Array<Transaction>} transactions
   * @param {Function} onClose - 关闭后的回调
   */
  ui.showCategoryManager = function(categories, transactions, onClose) {
    // 移除已有弹窗
    var existing = document.querySelector('.modal-overlay');
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = buildModalHTML(categories);
    document.body.appendChild(overlay);

    bindModalEvents(overlay, categories, transactions, onClose);
  };

  function buildModalHTML(categories) {
    var expenseCats = BK.filterCategoriesByType(categories, 'expense');
    var incomeCats = BK.filterCategoriesByType(categories, 'income');

    return '<div class="modal">' +
      '<h3>管理分类</h3>' +
      '<div class="mb-16">' +
      '  <h4 style="font-size:14px;margin-bottom:8px;">支出分类</h4>' +
      '  <div class="category-list" data-type="expense">' +
           renderCategoryTags(expenseCats) +
      '  </div>' +
      '</div>' +
      '<div class="mb-16">' +
      '  <h4 style="font-size:14px;margin-bottom:8px;">收入分类</h4>' +
      '  <div class="category-list" data-type="income">' +
           renderCategoryTags(incomeCats) +
      '  </div>' +
      '</div>' +
      '<div class="add-category-form" style="border-top:1px solid var(--color-border);padding-top:12px;">' +
      '  <h4 style="font-size:14px;margin-bottom:8px;">添加新分类</h4>' +
      '  <div style="display:flex;gap:8px;">' +
      '    <select id="new-cat-type" style="width:80px;padding:6px;">' +
      '      <option value="expense">支出</option>' +
      '      <option value="income">收入</option>' +
      '    </select>' +
      '    <input id="new-cat-icon" placeholder="图标" value="✨" style="width:60px;padding:6px;" maxlength="2">' +
      '    <input id="new-cat-name" placeholder="分类名称" style="flex:1;padding:6px;" maxlength="10">' +
      '    <button class="btn btn-primary" id="btn-add-cat">添加</button>' +
      '  </div>' +
      '  <div id="add-cat-error" style="color:var(--color-expense);font-size:12px;margin-top:4px;"></div>' +
      '</div>' +
      '<div class="modal-actions">' +
      '  <button class="btn" id="btn-close-modal">完成</button>' +
      '</div>' +
      '</div>';
  }

  function renderCategoryTags(categories) {
    if (categories.length === 0) return '<span style="color:var(--color-subtext);">暂无分类</span>';
    return categories.map(function(c) {
      var deleteBtn = c.isPreset ? '' : '<span class="cat-delete" data-id="' + c.id + '" style="cursor:pointer;margin-left:4px;" title="删除">×</span>';
      return '<span class="category-tag' + (c.isPreset ? ' preset' : '') + '" style="display:inline-flex;align-items:center;background:#f0f4ff;padding:4px 8px;border-radius:4px;margin:2px;">' +
        c.icon + ' ' + c.name + deleteBtn +
        '</span>';
    }).join('');
  }

  function bindModalEvents(overlay, categories, transactions, onClose) {
    // 关闭
    overlay.querySelector('#btn-close-modal').addEventListener('click', function() {
      overlay.remove();
      if (onClose) onClose();
    });
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) { overlay.remove(); if (onClose) onClose(); }
    });

    // 添加分类
    overlay.querySelector('#btn-add-cat').addEventListener('click', function() {
      var type = overlay.querySelector('#new-cat-type').value;
      var icon = overlay.querySelector('#new-cat-icon').value.trim() || '✨';
      var name = overlay.querySelector('#new-cat-name').value.trim();
      var errorEl = overlay.querySelector('#add-cat-error');

      var validation = BK.validateCategoryName(categories, name, type);
      if (!validation.valid) {
        errorEl.textContent = validation.message;
        return;
      }

      BK.addCategory(categories, { name: name, icon: icon, type: type });
      overlay.querySelector('#new-cat-name').value = '';
      errorEl.textContent = '';

      // 刷新弹窗内容
      overlay.querySelector('.modal').innerHTML = buildModalHTML(categories);
      bindModalEvents(overlay, categories, transactions, onClose);
    });

    // 删除分类（事件委托）
    overlay.addEventListener('click', function(e) {
      if (e.target.classList.contains('cat-delete')) {
        var id = e.target.dataset.id;
        var cat = BK.findCategoryById(categories, id);
        if (!cat || cat.isPreset) return;

        var txWithCat = transactions.filter(function(tx) { return tx.categoryId === id; });
        var msg = txWithCat.length > 0
          ? '删除后，该分类下的 ' + txWithCat.length + ' 条记录将归入"其他' + (cat.type === 'expense' ? '支出' : '收入') + '"。确认删除？'
          : '确认删除分类「' + cat.icon + ' ' + cat.name + '」？';

        if (confirm(msg)) {
          var result = BK.deleteCategory(categories, id, transactions);
          // 更新引用
          categories.length = 0;
          result.categories.forEach(function(c) { categories.push(c); });
          transactions.length = 0;
          result.transactions.forEach(function(t) { transactions.push(t); });

          // 刷新弹窗
          overlay.querySelector('.modal').innerHTML = buildModalHTML(categories);
          bindModalEvents(overlay, categories, transactions, onClose);
        }
      }
    });
  }
})(window.BK.ui);
```

- [ ] **步骤 2：更新 CSS 添加弹窗相关样式**

在 `css/style.css` 末尾追加：

```css
/* 分类标签 */
.category-tag {
  display: inline-flex;
  align-items: center;
  background: #f0f4ff;
  padding: 4px 10px;
  border-radius: 4px;
  margin: 2px;
  font-size: 13px;
}

.category-tag.preset {
  background: #fafafa;
  border: 1px solid var(--color-border);
}

.cat-delete {
  cursor: pointer;
  margin-left: 4px;
  color: var(--color-subtext);
  font-weight: bold;
}

.cat-delete:hover {
  color: var(--color-expense);
}
```

- [ ] **步骤 3：在浏览器中手动验证**

打开 `index.html` → 点击"管理分类"：
- 确认弹窗显示支出和收入分类，预设分类无删除按钮
- 添加新分类，确认出现在列表中
- 删除自定义分类（有/无记录两种情况），确认迁移提示
- 点击完成或点击遮罩关闭弹窗

- [ ] **步骤 4：Commit**

```bash
git add js/ui/category-manager.js css/style.css
git commit -m "feat: add category manager modal with add/delete"
```

---

### 任务 8：统计页 UI（stats.js）+ Chart.js

**文件：**
- 创建：`js/ui/stats.js`

- [ ] **步骤 1：编写统计页 UI 模块**

```javascript
// js/ui/stats.js
window.BK = window.BK || {};
window.BK.ui = window.BK.ui || {};

(function(ui) {
  var BK = window.BK;
  var chartInstances = {};

  /**
   * 渲染统计页
   * @param {HTMLElement} container
   * @param {Array<Transaction>} transactions
   * @param {Array<Category>} categories
   * @param {string} [monthKey] - 默认当前月份
   */
  ui.renderStatsTab = function(container, transactions, categories, monthKey) {
    monthKey = monthKey || BK.currentMonth();
    var stats = BK.calculateStats(transactions, categories, monthKey);
    var availableMonths = BK.getAvailableMonths(transactions);

    // 确保当前月份在列表中
    if (availableMonths.indexOf(monthKey) === -1) {
      availableMonths.unshift(monthKey);
    }

    container.innerHTML = '' +
      // 月份选择器
      '<div style="display:flex;justify-content:flex-end;margin-bottom:16px;">' +
      '  <select id="stats-month-select" style="padding:6px 12px;border:1px solid var(--color-border);border-radius:6px;">' +
           availableMonths.map(function(m) {
             return '<option value="' + m + '"' + (m === monthKey ? ' selected' : '') + '>' + m + '</option>';
           }).join('') +
      '  </select>' +
      '</div>' +

      // 概览卡片
      '<div class="stats-cards">' +
      '  <div class="stat-card income-card">' +
      '    <div class="stat-label">本月收入</div>' +
      '    <div class="stat-value text-income">+' + stats.totalIncome.toFixed(2) + '</div>' +
      '  </div>' +
      '  <div class="stat-card expense-card">' +
      '    <div class="stat-label">本月支出</div>' +
      '    <div class="stat-value text-expense">-' + stats.totalExpense.toFixed(2) + '</div>' +
      '  </div>' +
      '  <div class="stat-card balance-card">' +
      '    <div class="stat-label">本月结余</div>' +
      '    <div class="stat-value" style="color:' + (stats.balance >= 0 ? 'var(--color-balance)' : 'var(--color-expense)') + '">' +
           (stats.balance >= 0 ? '+' : '') + stats.balance.toFixed(2) +
      '    </div>' +
      '  </div>' +
      '</div>' +

      // 图表区 + 分类排行
      '<div class="stats-charts">' +
      '  <div class="card chart-container">' +
      '    <h3 style="margin-bottom:12px;">近6月收支趋势</h3>' +
      '    <canvas id="trend-chart" height="200"></canvas>' +
      '  </div>' +
      '  <div class="card chart-container">' +
      '    <h3 style="margin-bottom:12px;">本月分类占比</h3>' +
      '    <canvas id="pie-chart" height="200"></canvas>' +
      '  </div>' +
      '</div>' +

      // 分类排行
      '<div class="card" style="margin-top:16px;">' +
      '  <h3 style="margin-bottom:8px;">分类排行</h3>' +
      '  ' + renderCategoryRanking(stats.byCategory, stats.totalExpense + stats.totalIncome) +
      '</div>';

    // 渲染图表
    renderCharts(transactions, stats);

    // 月份切换事件
    container.querySelector('#stats-month-select').addEventListener('change', function() {
      destroyCharts();
      ui.renderStatsTab(container, transactions, categories, this.value);
    });
  };

  function renderCategoryRanking(byCategory, total) {
    if (byCategory.length === 0) {
      return '<div class="empty-state"><p>暂无数据</p></div>';
    }

    return byCategory.map(function(item, i) {
      var pct = total > 0 ? ((item.total / total) * 100).toFixed(1) : '0.0';
      var barWidth = total > 0 ? Math.max((item.total / total) * 100, 2) : 0;
      var colorClass = item.type === 'income' ? 'text-income' : 'text-expense';
      return '<div style="display:flex;align-items:center;padding:8px 0;border-bottom:1px solid var(--color-border);">' +
        '<span style="width:24px;color:var(--color-subtext);">' + (i + 1) + '.</span>' +
        '<span style="width:80px;">' + item.categoryIcon + ' ' + item.categoryName + '</span>' +
        '<span style="flex:1;margin:0 12px;">' +
        '  <div style="background:#f0f4ff;border-radius:4px;height:8px;overflow:hidden;">' +
        '    <div style="background:' + (item.type === 'income' ? 'var(--color-income)' : 'var(--color-expense)') + ';height:100%;width:' + barWidth + '%;border-radius:4px;"></div>' +
        '  </div>' +
        '</span>' +
        '<span class="' + colorClass + '" style="width:80px;text-align:right;">' + BK.formatCurrency(item.total, item.type) + '</span>' +
        '<span style="width:50px;text-align:right;color:var(--color-subtext);font-size:12px;">' + pct + '%</span>' +
        '</div>';
    }).join('');
  }

  function renderCharts(transactions, stats) {
    // 销毁旧图表
    destroyCharts();

    // 趋势柱状图
    var trend = BK.getMonthlyTrend(transactions, 6);
    var trendCtx = document.getElementById('trend-chart');
    if (trendCtx) {
      chartInstances.trend = new Chart(trendCtx, {
        type: 'bar',
        data: {
          labels: trend.map(function(t) { return t.month; }),
          datasets: [
            {
              label: '支出',
              data: trend.map(function(t) { return t.expense; }),
              backgroundColor: '#e74c3c',
              borderRadius: 4
            },
            {
              label: '收入',
              data: trend.map(function(t) { return t.income; }),
              backgroundColor: '#2ecc71',
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } },
          scales: {
            y: { beginAtZero: true, ticks: { callback: function(v) { return '¥' + v; } } }
          }
        }
      });
    }

    // 支出分类饼图
    var expenseData = stats.byCategory.filter(function(c) { return c.type === 'expense'; });
    var pieCtx = document.getElementById('pie-chart');
    if (pieCtx && expenseData.length > 0) {
      chartInstances.pie = new Chart(pieCtx, {
        type: 'doughnut',
        data: {
          labels: expenseData.map(function(c) { return c.categoryIcon + ' ' + c.categoryName; }),
          datasets: [{
            data: expenseData.map(function(c) { return c.total; }),
            backgroundColor: [
              '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db',
              '#9b59b6', '#1abc9c', '#e91e63', '#00bcd4', '#ff5722'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { font: { size: 11 } } }
          }
        }
      });
    } else if (pieCtx) {
      // 无数据时也创建一个空图表（Canvas 需要内容）
      var ctx2d = pieCtx.getContext('2d');
      ctx2d.font = '14px sans-serif';
      ctx2d.fillStyle = '#999';
      ctx2d.textAlign = 'center';
      ctx2d.fillText('暂无数据', pieCtx.width / 2, pieCtx.height / 2);
    }
  }

  function destroyCharts() {
    if (chartInstances.trend) { chartInstances.trend.destroy(); chartInstances.trend = null; }
    if (chartInstances.pie) { chartInstances.pie.destroy(); chartInstances.pie = null; }
  }
})(window.BK.ui);
```

- [ ] **步骤 2：更新 CSS 添加统计页样式**

在 `css/style.css` 末尾追加：

```css
/* 统计页 */
.stats-cards {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.stat-card {
  flex: 1;
  background: var(--color-card);
  border-radius: var(--radius);
  padding: 20px;
  text-align: center;
  box-shadow: var(--shadow);
}

.stat-card.income-card { border-top: 3px solid var(--color-income); }
.stat-card.expense-card { border-top: 3px solid var(--color-expense); }
.stat-card.balance-card { border-top: 3px solid var(--color-balance); }

.stat-label {
  font-size: 13px;
  color: var(--color-subtext);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
}

.stats-charts {
  display: flex;
  gap: 16px;
}

.chart-container {
  flex: 1;
  min-height: 280px;
}

.chart-container canvas {
  max-height: 220px;
}
```

- [ ] **步骤 3：更新 app.js 集成统计页**

在 `js/app.js` 的 `switchTab` 函数中替换 stats 的占位：

```javascript
// 将 stats 分支改为：
} else if (tab === 'stats') {
  BK.ui.renderStatsTab(mainContent, transactions, categories);
}
```

- [ ] **步骤 4：在浏览器中手动验证**

打开 `index.html` → 切换到"统计" Tab：
- 先确认无数据时显示空状态
- 切回记账页，添加几条不同分类、不同月份的记录
- 切回统计页，确认：
  - 概览卡片数字正确
  - 趋势柱状图显示近6月数据
  - 饼图显示分类占比
  - 分类排行带进度条
  - 切换月份，数据随之变化

- [ ] **步骤 5：Commit**

```bash
git add js/ui/stats.js css/style.css js/app.js
git commit -m "feat: add statistics tab with charts and category ranking"
```

---

### 任务 9：收尾整合与 README

**文件：**
- 创建：`README.md`
- 修改：`js/app.js`（最终完善）、`index.html`（meta 信息）

- [ ] **步骤 1：完善 app.js 最终版**

确保 `js/app.js` 完整内容为：

```javascript
// js/app.js
window.BK = window.BK || {};

(function() {
  var BK = window.BK;
  var currentTab = 'record';
  var currentMonth = BK.currentMonth();
  var categories = [];
  var transactions = [];
  var mainContent = document.getElementById('main-content');

  function init() {
    categories = BK.initCategories();
    transactions = BK.loadTransactions();
    switchTab('record');

    document.querySelectorAll('.tab-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        switchTab(this.dataset.tab);
      });
    });
  }

  function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // 刷新数据（可能被弹窗修改）
    transactions = BK.loadTransactions();
    categories = BK.loadCategories();

    if (tab === 'record') {
      BK.ui.renderRecordTab(mainContent, transactions, categories);
    } else if (tab === 'stats') {
      BK.ui.renderStatsTab(mainContent, transactions, categories, currentMonth);
    }
  }

  window.BK.refreshUI = function() {
    switchTab(currentTab);
  };

  init();
})();
```

- [ ] **步骤 2：编写 README.md**

```markdown
# 记账小系统

轻量级个人记账 Web 应用，纯前端 + localStorage，无需后端。

## 功能

- 📝 收支记录录入（类型、金额、分类、日期、备注）
- 📋 流水列表查看与删除
- 🏷️ 分类管理（13 个预设 + 自定义增删）
- 📊 月度统计（收支概览、趋势柱状图、分类饼图、排行）

## 使用方式

直接在浏览器中打开 `index.html` 即可使用。

## 技术栈

- Vanilla JS（无框架）
- 纯 CSS（CSS 变量）
- Chart.js 4.x（CDN）
- localStorage 持久化

## 项目结构

```
bookkeeping/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js              # 入口、Tab 切换
│   ├── storage.js           # localStorage 封装
│   ├── utils.js             # 工具函数
│   ├── categories.js        # 分类业务逻辑
│   ├── transactions.js      # 交易记录逻辑
│   └── ui/
│       ├── record.js        # 记账页 UI
│       ├── stats.js         # 统计页 UI
│       └── category-manager.js  # 分类管理弹窗
├── tests/
│   ├── test.html
│   ├── test-utils.js
│   ├── test-storage.js
│   ├── test-categories.js
│   └── test-transactions.js
└── README.md
```
```

- [ ] **步骤 3：全面手动验证**

在浏览器中完成以下全流程测试：
1. 打开 `index.html`，首次使用显示空状态
2. 添加 5+ 条不同类型的收支记录
3. 删除一条记录
4. 打开分类管理，添加 1 个自定义分类，删除 1 个自定义分类（确认记录迁移）
5. 切换到统计页，确认所有数字和图表正确
6. 切换月份，确认数据过滤正确
7. 刷新页面，确认所有数据持久化
8. 打开 `tests/test.html`，确认所有测试通过

- [ ] **步骤 4：Commit**

```bash
git add js/app.js README.md
git commit -m "docs: add README and finalize app integration"
```

---

## 测试策略

- **单元测试：** `tests/test.html` 覆盖 utils、storage、categories、transactions 四大逻辑模块
- **手动验证：** UI 交互通过浏览器手动测试，关注表单提交、列表渲染、图表展示、数据持久化
- **边界测试：** 空状态、非法输入、删除联动、月份切换均需手动验证

## 相关文档

- 设计规格：`docs/superpowers/specs/2026-05-30-bookkeeping-design.md`
