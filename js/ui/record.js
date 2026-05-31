// js/ui/record.js
window.BK = window.BK || {};
window.BK.ui = window.BK.ui || {};

(function(ui) {
  var BK = window.BK;

  ui.renderRecordTab = function(container, transactions, categories) {
    var cats = categories || [];
    var expenseCats = BK.filterCategoriesByType(cats, 'expense');
    var incomeCats = BK.filterCategoriesByType(cats, 'income');

    container.innerHTML = '' +
      '<div class="record-layout">' +
      // 表单
      '  <div class="record-form card">' +
      '    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">' +
      '      <h3 style="margin-bottom:0;">记一笔</h3>' +
      '      <button class="btn btn-small" id="btn-manage-cat" style="color:var(--color-subtext);padding:4px 8px;font-size:12px;">管理分类</button>' +
      '    </div>' +
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
      '    <button class="btn btn-primary" id="btn-submit" style="width:100%;padding:10px;font-size:14px;">✏️ 记一笔</button>' +
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
    if (!categories || categories.length === 0) {
      return '<option value="">-- 暂无分类 --</option>';
    }
    return categories.map(function(c) {
      return '<option value="' + c.id + '">' + c.icon + ' ' + c.name + '</option>';
    }).join('');
  }

  function renderTransactionList(transactions, categories) {
    if (!transactions || transactions.length === 0) {
      return '<div class="empty-state">' +
        '<span class="icon">📝</span>' +
        '<p>还没有记录</p>' +
        '<p class="hint">记下第一笔吧！</p>' +
        '</div>';
    }

    var sorted = BK.getAllTransactions(transactions);
    return '<table class="data-table">' +
      '<thead><tr><th>日期</th><th>类别</th><th>备注</th><th style="text-align:right;">金额</th><th></th></tr></thead>' +
      '<tbody>' +
      sorted.map(function(tx) {
        var cat = BK.findCategoryById(categories, tx.categoryId);
        var colorClass = tx.type === 'income' ? 'text-income' : 'text-expense';
        return '<tr data-tx-id="' + tx.id + '">' +
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
    submitBtn.addEventListener('click', async function() {
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

      submitBtn.textContent = '保存中...';
      submitBtn.disabled = true;

      try {
        await BK.addTransaction(transactions, {
          type: currentType,
          amount: amount,
          categoryId: categoryId,
          note: note,
          date: date
        });
      } catch (e) {
        console.error('[记账] 保存失败：', e);
        alert('保存失败：' + e.message);
        submitBtn.textContent = '✏️ 记一笔';
        submitBtn.disabled = false;
        return;
      }

      // 清空表单
      amountEl.value = '';
      container.querySelector('#tx-note').value = '';
      amountEl.focus();
      submitBtn.textContent = '✏️ 记一笔';
      submitBtn.disabled = false;

      // 重新渲染
      ui.renderRecordTab(container, transactions, categories);
    });

    // 删除 & 管理分类 & 回车提交 — 事件委托，只绑定一次，避免重复绑定导致多重触发
    if (!container._eventsBound) {
      container._eventsBound = true;

      // 删除按钮 — 先删数据库和数组，再精准移除 DOM 行
      container.addEventListener('click', async function(e) {
        var btn = e.target.closest && e.target.closest('.btn-delete');
        if (!btn) return;

        var id = btn.dataset.id;
        btn.textContent = '...';
        btn.disabled = true;
        try {
          await BK.deleteTransactionRecord(id);
          for (var i = transactions.length - 1; i >= 0; i--) {
            if (transactions[i].id === id) { transactions.splice(i, 1); break; }
          }
        } catch (err) {
          console.error('[删除] 删除失败：', err);
          alert('删除失败：' + err.message);
          btn.textContent = '删除';
          btn.disabled = false;
          return;
        }
        // 全量刷新 UI，保证与数据层一致（与添加记录保持相同的刷新策略）
        BK.refreshUI();
      });

      // 管理分类按钮（事件委托，因为按钮元素会被重建）
      container.addEventListener('click', function(e) {
        if (!e.target.closest || !e.target.closest('#btn-manage-cat')) return;
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
          var sb = container.querySelector('#btn-submit');
          if (sb) sb.click();
        }
      });
    }
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
})(window.BK.ui);
