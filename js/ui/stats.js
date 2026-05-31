// js/ui/stats.js
window.BK = window.BK || {};
window.BK.ui = window.BK.ui || {};

(function(ui) {
  var BK = window.BK;
  var chartInstances = {};

  ui.renderStatsTab = function(container, transactions, categories, monthKey) {
    monthKey = monthKey || BK.currentMonth();
    var stats = BK.calculateStats(transactions, categories, monthKey);
    var availableMonths = BK.getAvailableMonths(transactions);
    var hasAnyData = transactions.length > 0;

    // 确保当前月份在列表中
    if (availableMonths.indexOf(monthKey) === -1) {
      availableMonths.unshift(monthKey);
    }

    var expenseCats = stats.byCategory.filter(function(c) { return c.type === 'expense'; });
    var incomeCats = stats.byCategory.filter(function(c) { return c.type === 'income'; });
    var hasMonthData = stats.totalIncome > 0 || stats.totalExpense > 0;

    container.innerHTML = '' +
      // 月份选择器（有数据才显示）
      (hasAnyData ?
      '<div class="month-select-wrap">' +
      '  <select id="stats-month-select">' +
           availableMonths.map(function(m) {
             return '<option value="' + m + '"' + (m === monthKey ? ' selected' : '') + '>📅 ' + m + '</option>';
           }).join('') +
      '  </select>' +
      '</div>' : '') +

      // 概览卡片
      '<div class="stats-cards">' +
      '  <div class="stat-card income-card">' +
      '    <span class="stat-icon">💰</span>' +
      '    <div class="stat-label">本月收入</div>' +
      '    <div class="stat-value text-income">+' + stats.totalIncome.toFixed(2) + '</div>' +
      '  </div>' +
      '  <div class="stat-card expense-card">' +
      '    <span class="stat-icon">💳</span>' +
      '    <div class="stat-label">本月支出</div>' +
      '    <div class="stat-value text-expense">-' + stats.totalExpense.toFixed(2) + '</div>' +
      '  </div>' +
      '  <div class="stat-card balance-card">' +
      '    <span class="stat-icon">🏦</span>' +
      '    <div class="stat-label">本月结余</div>' +
      '    <div class="stat-value" style="color:' + (stats.balance >= 0 ? 'var(--color-balance)' : 'var(--color-expense)') + '">' +
           (stats.balance >= 0 ? '+' : '') + stats.balance.toFixed(2) +
      '    </div>' +
      '  </div>' +
      '</div>' +

      // 无数据：全局空状态
      (!hasAnyData ?
      '<div class="card" style="text-align:center;">' +
      '  <div class="empty-state">' +
      '    <span class="icon">📊</span>' +
      '    <p>还没有数据</p>' +
      '    <p class="hint">去「记账」Tab 记下第一笔吧！</p>' +
      '  </div>' +
      '</div>' :

      // 有数据：图表 + 排行
      '' +
      // 趋势图（独占一行）
      '<div class="stats-charts">' +
      '  <div class="card chart-container">' +
      '    <h3>📊 近6月收支趋势</h3>' +
      '    <canvas id="trend-chart" height="200"></canvas>' +
      '  </div>' +
      '</div>' +

      // 支出 + 收入饼图（并排等宽）
      '<div class="stats-charts">' +
      '  <div class="card chart-container">' +
      '    <h3>🥧 支出分类占比</h3>' +
           (hasMonthData && expenseCats.length > 0
             ? '<canvas id="expense-pie-chart" height="200"></canvas>'
             : '<div class="empty-state" style="padding:50px 20px;"><p>' + (hasMonthData ? '暂无支出' : '本月无数据') + '</p></div>') +
      '  </div>' +
      (incomeCats.length > 0 ?
      '  <div class="card chart-container">' +
      '    <h3>🥧 收入分类占比</h3>' +
      '    <canvas id="income-pie-chart" height="200"></canvas>' +
      '  </div>' : '') +
      '</div>' +

      // 分类排行
      '<div class="card" style="margin-top:16px;">' +
      '  <h3 style="margin-bottom:12px;">🔴 支出排行</h3>' +
      '  ' + renderCategoryRanking(expenseCats, stats.totalExpense, 'expense') +
      '</div>' +
      '<div class="card" style="margin-top:16px;">' +
      '  <h3 style="margin-bottom:12px;">🟢 收入排行</h3>' +
      '  ' + renderCategoryRanking(incomeCats, stats.totalIncome, 'income') +
      '</div>');

    // 渲染图表
    if (hasAnyData) {
      renderCharts(transactions, stats, expenseCats, incomeCats);
    }

    // 月份切换事件
    var monthSelect = container.querySelector('#stats-month-select');
    if (monthSelect) {
      monthSelect.addEventListener('change', function() {
        destroyCharts();
        ui.renderStatsTab(container, transactions, categories, this.value);
      });
    }
  };

  function renderCategoryRanking(byCategory, total, type) {
    if (byCategory.length === 0) {
      return '<div class="empty-state"><p>暂无' + (type === 'income' ? '收入' : '支出') + '数据</p></div>';
    }

    return byCategory.map(function(item, i) {
      var pct = total > 0 ? ((item.total / total) * 100).toFixed(1) : '0.0';
      var barWidth = total > 0 ? Math.max((item.total / total) * 100, 2) : 0;
      var colorClass = type === 'income' ? 'text-income' : 'text-expense';
      var barColor = type === 'income' ? 'var(--color-income)' : 'var(--color-expense)';
      var rankClass = i < 3 ? ' top' : '';
      return '<div class="ranking-item">' +
        '<span class="rank-num' + rankClass + '">' + (i + 1) + '</span>' +
        '<span class="rank-label">' + item.categoryIcon + ' ' + item.categoryName + '</span>' +
        '<span class="rank-bar-wrap">' +
        '  <div class="rank-bar" style="background:' + barColor + ';width:' + barWidth + '%;"></div>' +
        '</span>' +
        '<span class="rank-amount ' + colorClass + '">' + BK.formatCurrency(item.total, type) + '</span>' +
        '<span class="rank-pct">' + pct + '%</span>' +
        '</div>';
    }).join('');
  }

  function renderCharts(transactions, stats, expenseCats, incomeCats) {
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
            { label: '支出', data: trend.map(function(t) { return t.expense; }), backgroundColor: '#ef4444', borderRadius: 4 },
            { label: '收入', data: trend.map(function(t) { return t.income; }), backgroundColor: '#10b981', borderRadius: 4 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } },
          scales: { y: { beginAtZero: true, ticks: { callback: function(v) { return '¥' + v; } } } }
        }
      });
    }

    // 支出饼图
    var expenseCtx = document.getElementById('expense-pie-chart');
    if (expenseCtx && expenseCats.length > 0) {
      chartInstances.expensePie = renderDoughnut(expenseCtx, expenseCats);
    }

    // 收入饼图
    var incomeCtx = document.getElementById('income-pie-chart');
    if (incomeCtx && incomeCats.length > 0) {
      chartInstances.incomePie = renderDoughnut(incomeCtx, incomeCats);
    }
  }

  function renderDoughnut(ctx, data) {
    return new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map(function(c) { return c.categoryIcon + ' ' + c.categoryName; }),
        datasets: [{
          data: data.map(function(c) { return c.total; }),
          backgroundColor: [
            '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
            '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1',
            '#e11d48', '#d97706', '#059669', '#2563eb', '#7c3aed'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } }
      }
    });
  }

  function destroyCharts() {
    if (chartInstances.trend) { chartInstances.trend.destroy(); chartInstances.trend = null; }
    if (chartInstances.expensePie) { chartInstances.expensePie.destroy(); chartInstances.expensePie = null; }
    if (chartInstances.incomePie) { chartInstances.incomePie.destroy(); chartInstances.incomePie = null; }
  }
})(window.BK.ui);
