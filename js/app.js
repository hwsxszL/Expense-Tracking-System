// js/app.js — 账号密码登录版
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
  var btnLogout = document.getElementById('btn-logout');

  // 登录表单元素
  var loginForm = document.getElementById('login-form');
  var registerForm = document.getElementById('register-form');
  var loginAccount = document.getElementById('login-account');
  var loginPassword = document.getElementById('login-password');
  var btnLogin = document.getElementById('btn-login');
  var loginError = document.getElementById('login-error');
  var registerPassword = document.getElementById('register-password');
  var btnRegister = document.getElementById('btn-register');
  var registerError = document.getElementById('register-error');

  // 注册成功弹窗
  var successModal = document.getElementById('register-success-modal');
  var newAccountDisplay = document.getElementById('new-account-display');
  var btnGotoLogin = document.getElementById('btn-goto-login');

  // 登录/注册 Tab 切换
  document.querySelectorAll('.login-tab-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var target = this.dataset.loginTab;
      document.querySelectorAll('.login-tab-btn').forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');

      if (target === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        loginError.classList.add('hidden');
        loginAccount.focus();
      } else {
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        registerError.classList.add('hidden');
        registerPassword.focus();
      }
    });
  });

  // 检查是否已登录
  if (BK.getAccountId()) {
    showApp();
  } else {
    showLogin();
  }

  // 登录按钮
  btnLogin.addEventListener('click', async function() {
    var account = loginAccount.value.trim();
    var password = loginPassword.value.trim();

    // 验证账号
    if (!account) { showLoginError('请输入账号'); return; }
    if (!/^\d{8}$/.test(account)) { showLoginError('账号为 8 位数字'); return; }
    if (!password) { showLoginError('请输入密码'); return; }
    if (password.length < 3) { showLoginError('密码至少 3 位'); return; }

    btnLogin.textContent = '登录中...';
    btnLogin.disabled = true;
    loginError.classList.add('hidden');

    try {
      var user = await BK.loginUser(account, password);
      if (user) {
        BK.setAccountId(user.account);
        if (user.nickname) {
          BK.setNickname(user.nickname);
        } else {
          localStorage.removeItem('bk_nickname');
        }
        loginPassword.value = '';
        loginError.classList.add('hidden');
        await showApp();
      } else {
        showLoginError('账号或密码错误');
        btnLogin.textContent = '进入';
        btnLogin.disabled = false;
      }
    } catch (e) {
      showLoginError('登录失败：' + e.message);
      btnLogin.textContent = '进入';
      btnLogin.disabled = false;
    }
  });

  // 注册按钮
  btnRegister.addEventListener('click', async function() {
    var password = registerPassword.value.trim();

    if (!password) { showRegisterError('请设置密码'); return; }
    if (password.length < 3) { showRegisterError('密码至少 3 位'); return; }

    btnRegister.textContent = '注册中...';
    btnRegister.disabled = true;
    registerError.classList.add('hidden');

    try {
      var nickname = document.getElementById('register-nickname').value.trim();
      var result = await BK.registerUser(password, nickname || undefined);
      // 显示注册成功弹窗
      newAccountDisplay.textContent = result.account;
      successModal.classList.remove('hidden');
      registerPassword.value = '';
      document.getElementById('register-nickname').value = '';
      btnRegister.textContent = '注册';
      btnRegister.disabled = false;
    } catch (e) {
      showRegisterError('注册失败：' + e.message);
      btnRegister.textContent = '注册';
      btnRegister.disabled = false;
    }
  });

  // 注册成功 → 去登录
  btnGotoLogin.addEventListener('click', function() {
    var account = newAccountDisplay.textContent;
    successModal.classList.add('hidden');
    switchToLoginTab(account);
  });

  // 关闭成功弹窗（点击遮罩）
  successModal.addEventListener('click', function(e) {
    if (e.target === successModal) {
      successModal.classList.add('hidden');
      switchToLoginTab();
    }
  });

  // 键盘事件
  loginPassword.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') btnLogin.click();
  });
  registerPassword.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') btnRegister.click();
  });
  loginAccount.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') loginPassword.focus();
  });

  btnLogout.addEventListener('click', function() {
    if (confirm('确定要退出吗？')) {
      BK.clearSession();
      location.reload();
    }
  });

  function showLogin() {
    loginScreen.classList.remove('hidden');
    appEl.classList.add('hidden');
  }

  function switchToLoginTab(account) {
    document.querySelectorAll('.login-tab-btn').forEach(function(b) { b.classList.remove('active'); });
    var loginTabBtn = document.querySelector('[data-login-tab="login"]');
    if (loginTabBtn) loginTabBtn.classList.add('active');
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    loginError.classList.add('hidden');
    if (account) {
      loginAccount.value = account;
      loginPassword.focus();
    } else {
      loginAccount.focus();
    }
  }

  function showLoginError(msg) {
    loginError.textContent = msg;
    loginError.classList.remove('hidden');
  }

  function showRegisterError(msg) {
    registerError.textContent = msg;
    registerError.classList.remove('hidden');
  }

  function renderHeaderName() {
    var nickname = BK.getNickname();
    var displayEl = document.getElementById('header-name-display');
    var editIcon = document.getElementById('header-name-edit-icon');
    if (displayEl) {
      if (nickname) {
        displayEl.textContent = '你好，' + nickname;
        displayEl.style.color = '';
      } else {
        displayEl.textContent = '账号 ' + BK.getAccountId();
        displayEl.style.color = 'var(--color-subtext)';
      }
    }
    if (editIcon) {
      editIcon.style.display = nickname ? '' : 'none';
    }
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

    renderHeaderName();

    switchTab('record');

    document.querySelectorAll('.tab-btn[data-tab]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        switchTab(this.dataset.tab);
      });
    });

    // ===== 昵称编辑 =====

    var nameDisplay = document.getElementById('header-name-display');
    var nameEditIcon = document.getElementById('header-name-edit-icon');
    var nameEditor = document.getElementById('header-name-editor');
    var nameInput = document.getElementById('header-name-input');
    var nameSave = document.getElementById('header-name-save');
    var nameCancel = document.getElementById('header-name-cancel');

    if (nameDisplay && nameEditor && nameInput && nameSave && nameCancel) {

      function enterEditMode() {
        var currentNickname = BK.getNickname() || '';
        nameInput.value = currentNickname;
        nameDisplay.style.display = 'none';
        if (nameEditIcon) nameEditIcon.style.display = 'none';
        nameEditor.style.display = '';
        nameInput.focus();
      }

      function exitEditMode() {
        nameDisplay.style.display = '';
        var nickname = BK.getNickname();
        if (nameEditIcon) nameEditIcon.style.display = nickname ? '' : 'none';
        nameEditor.style.display = 'none';
      }

      nameDisplay.addEventListener('click', enterEditMode);
      if (nameEditIcon) nameEditIcon.addEventListener('click', enterEditMode);

      nameSave.addEventListener('click', async function() {
        var newName = nameInput.value.trim();
        nameSave.textContent = '...';
        nameSave.disabled = true;
        try {
          if (newName) {
            await BK.updateNickname(newName);
          } else {
            // 清空昵称
            await BK.updateNickname(null);
          }
          renderHeaderName();
          exitEditMode();
        } catch (e) {
          alert('保存失败：' + e.message);
        }
        nameSave.textContent = '💾';
        nameSave.disabled = false;
      });

      nameCancel.addEventListener('click', exitEditMode);

      nameInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          nameSave.click();
        } else if (e.key === 'Escape') {
          exitEditMode();
        }
      });
    }
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
    console.log('[refreshUI] currentTab:', currentTab, 'transactions.length:', transactions.length);
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
