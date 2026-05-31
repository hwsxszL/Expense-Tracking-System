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
