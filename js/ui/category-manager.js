// js/ui/category-manager.js
window.BK = window.BK || {};
window.BK.ui = window.BK.ui || {};

(function(ui) {
  var BK = window.BK;

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
    var isRefresh = !!overlay._bound;

    // overlay 级别事件只绑定一次，避免刷新时重复绑定
    if (!isRefresh) {
      overlay._bound = true;

      // 遮罩层点击关闭
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
          overlay.remove();
          if (onClose) onClose();
        }
      });

      // 删除分类（事件委托在 overlay 上，只绑定一次）
      overlay.addEventListener('click', function(e) {
        if (!e.target.classList.contains('cat-delete')) return;

        var id = e.target.dataset.id;
        var cat = BK.findCategoryById(categories, id);
        if (!cat || cat.isPreset) return;

        var txWithCat = transactions.filter(function(tx) { return tx.categoryId === id; });
        var msg = txWithCat.length > 0
          ? '删除后，该分类下的 ' + txWithCat.length + ' 条记录将归入"其他' + (cat.type === 'expense' ? '支出' : '收入') + '"。确认删除？'
          : '确认删除分类「' + cat.icon + ' ' + cat.name + '」？';

        if (confirm(msg)) {
          var result = BK.deleteCategory(categories, id, transactions);
          // 更新引用（categories 和 transactions 来自外部，需原地替换）
          categories.length = 0;
          result.categories.forEach(function(c) { categories.push(c); });
          transactions.length = 0;
          result.transactions.forEach(function(t) { transactions.push(t); });

          // 刷新弹窗内容（不重建 overlay，只更新内部 HTML）
          overlay.querySelector('.modal').innerHTML = buildModalHTML(categories);
          bindModalEvents(overlay, categories, transactions, onClose);
        }
      });
    }

    // 以下元素在 .modal 内部，每次刷新后需重新绑定

    // 完成按钮
    overlay.querySelector('#btn-close-modal').addEventListener('click', function() {
      overlay.remove();
      if (onClose) onClose();
    });

    // 添加分类按钮
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
      overlay.querySelector('#new-cat-icon').value = '✨';
      errorEl.textContent = '';

      // 刷新弹窗内容
      overlay.querySelector('.modal').innerHTML = buildModalHTML(categories);
      bindModalEvents(overlay, categories, transactions, onClose);
    });
  }
})(window.BK.ui);
