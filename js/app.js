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
      // 待任务 8 实现
      mainContent.innerHTML = '<div class="empty-state"><div class="icon">📊</div><p>统计功能即将上线</p></div>';
    }
  }

  window.BK.refreshUI = function() {
    transactions = BK.loadTransactions();
    categories = BK.loadCategories();
    switchTab(currentTab);
  };

  init();
})();
