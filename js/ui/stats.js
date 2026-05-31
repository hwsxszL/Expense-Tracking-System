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

      // 图表区
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
      // 无数据时显示提示文字
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
