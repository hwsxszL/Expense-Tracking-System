// js/app.js — 云存储版，含登录流程
window.BK = window.BK || {};

(function() {
  var BK = window.BK;
  var currentTab = 'record';
  var currentMonth = BK.currentMonth();
  var categories = [];
  var transactions = [];
  var mainContent = document.getElementById('main-content');

  // ===== 登录流程 =====

  var loginScreen = document.getElementById('login-screen');
  var appEl = document.getElementById('app');
  var passphraseInput = document.getElementById('passphrase-input');
  var btnLogin = document.getElementById('btn-login');
  var btnLogout = document.getElementById('btn-logout');

  // 检查是否已登录
  if (BK.getUserHash()) {
    showApp();
  } else {
    showLogin();
  }

  btnLogin.addEventListener('click', async function() {
    var passphrase = passphraseInput.value.trim();
    if (!passphrase) { alert('请输入密码'); return; }
    if (passphrase.length < 3) { alert('密码至少 3 位'); return; }

    btnLogin.textContent = '加载中...';
    btnLogin.disabled = true;

    try {
      var hash = await BK.hashPassphrase(passphrase);
      BK.setUserHash(hash);
      passphraseInput.value = '';
      await showApp();
    } catch (e) {
      alert('登录失败：' + e.message);
      BK.clearSession();
      btnLogin.textContent = '进入';
      btnLogin.disabled = false;
    }
  });

  passphraseInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') btnLogin.click();
  });

  btnLogout.addEventListener('click', function() {
    if (confirm('确定要退出吗？下次用同一密码就能恢复数据。')) {
      BK.clearSession();
      location.reload();
    }
  });

  function showLogin() {
    loginScreen.classList.remove('hidden');
    appEl.classList.add('hidden');
  }

  async function showApp() {
    try {
      categories = await BK.initCategories();
      transactions = await BK.loadTransactions();
    } catch (e) {
      alert('加载数据失败：' + e.message);
      BK.clearSession();
      showLogin();
      btnLogin.textContent = '进入';
      btnLogin.disabled = false;
      return;
    }

    loginScreen.classList.add('hidden');
    appEl.classList.remove('hidden');

    switchTab('record');

    document.querySelectorAll('.tab-btn[data-tab]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        switchTab(this.dataset.tab);
      });
    });
  }

  // ===== Tab 切换 =====

  function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-btn[data-tab]').forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    if (tab === 'record') {
      BK.ui.renderRecordTab(mainContent, transactions, categories);
    } else if (tab === 'stats') {
      BK.ui.renderStatsTab(mainContent, transactions, categories, currentMonth);
    }
  }

  // ===== 全局刷新 =====

  window.BK.refreshUI = function() {
    switchTab(currentTab);
  };

  // 供 UI 模块使用的数据访问
  window.BK.getTransactions = function() { return transactions; };
  window.BK.setTransactions = function(txs) { transactions = txs; };
  window.BK.getCategories = function() { return categories; };
  window.BK.setCategories = function(cats) { categories = cats; };

  // 重新从云端加载
  window.BK.reloadFromCloud = async function() {
    transactions = await BK.loadTransactions();
    categories = await BK.initCategories();
    switchTab(currentTab);
  };
})();
