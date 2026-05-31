# 用户昵称功能 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 为记账小系统添加用户昵称功能——注册时可选填，登录后点击昵称直接编辑，昵称替代账号数字显示在顶部。

**架构：** Supabase `users` 表新增 `nickname` 列（TEXT, nullable）。注册/登录/编辑三个流程贯通同一字段，localStorage 缓存昵称减少网络请求。

**技术栈：** Vanilla JS + Supabase REST API + localStorage

---

### 任务 1：Supabase 数据库迁移 — users 表加 nickname 列

**文件：** 无代码变更（Supabase 控制台操作）

- [ ] **步骤 1：在 Supabase 控制台执行 SQL**

登录 [Supabase Dashboard](https://supabase.com/dashboard)，进入项目 `zztqipetwrguckdvpzsj`，打开 SQL Editor，执行：

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS nickname TEXT;
```

- [ ] **步骤 2：验证列已添加**

在 Supabase Table Editor 中查看 `users` 表，确认 `nickname` 列存在且类型为 `text`，Nullable 为 ✓。

---

### 任务 2：更新 supabase.js — registerUser、loginUser、新增 updateNickname

**文件：**
- 修改：`js/supabase.js`

- [ ] **步骤 1：修改 `registerUser` 函数，增加 nickname 参数**

当前 `registerUser` 签名为 `async function(password)`，注册时写入 `account`、`password_hash`、`created_at`。

修改为 `async function(password, nickname)`，在 body 中增加 nickname 字段（可选，传 null 时省略）：

找到 `registerUser` 函数（约第 35 行），修改：

```javascript
// 修改前：
ns.registerUser = async function(password) {
  ...
  await ns.supabaseFetch('POST', 'users', {
    body: {
      account: account,
      password_hash: passwordHash,
      created_at: new Date().toISOString()
    },
    prefer: 'return=minimal'
  });

// 修改后：
ns.registerUser = async function(password, nickname) {
  ...
  var body = {
    account: account,
    password_hash: passwordHash,
    created_at: new Date().toISOString()
  };
  if (nickname) {
    body.nickname = nickname.trim().slice(0, 12);
  }
  await ns.supabaseFetch('POST', 'users', {
    body: body,
    prefer: 'return=minimal'
  });
```

- [ ] **步骤 2：修改 `loginUser` 函数，返回 nickname**

当前 `loginUser` 的 select 只查 `account`，返回 `data[0].account`。

修改 select 查询 `account,nickname`，返回 `{ account, nickname }` 对象：

```javascript
// 修改前：
ns.loginUser = async function(account, password) {
  var passwordHash = await ns.hashPassphrase(password);
  var data = await ns.supabaseFetch('GET', 'users', {
    select: 'account',
    filter: 'account=eq.' + encodeURIComponent(account) + ',password_hash=eq.' + encodeURIComponent(passwordHash),
    limit: 1
  });
  if (data && data.length > 0) {
    return data[0].account;
  }
  return null;
};

// 修改后：
ns.loginUser = async function(account, password) {
  var passwordHash = await ns.hashPassphrase(password);
  var data = await ns.supabaseFetch('GET', 'users', {
    select: 'account,nickname',
    filter: 'account=eq.' + encodeURIComponent(account) + ',password_hash=eq.' + encodeURIComponent(passwordHash),
    limit: 1
  });
  if (data && data.length > 0) {
    return { account: data[0].account, nickname: data[0].nickname || null };
  }
  return null;
};
```

- [ ] **步骤 3：新增 `updateNickname` 函数**

在 `clearSession` 函数旁边新增：

```javascript
/**
 * 更新用户昵称
 */
ns.updateNickname = async function(nickname) {
  var accountId = ns.getAccountId();
  if (!accountId) throw new Error('未登录');
  var trimmed = nickname ? nickname.trim().slice(0, 12) : null;
  await ns.supabaseFetch('PATCH', 'users', {
    filter: 'account=eq.' + encodeURIComponent(accountId),
    body: { nickname: trimmed },
    prefer: 'return=minimal'
  });
  ns.setNickname(trimmed);
  return trimmed;
};

/**
 * 获取本地缓存的昵称
 */
ns.getNickname = function() {
  return localStorage.getItem('bk_nickname') || null;
};

/**
 * 保存昵称到本地缓存
 */
ns.setNickname = function(nickname) {
  if (nickname) {
    localStorage.setItem('bk_nickname', nickname);
  } else {
    localStorage.removeItem('bk_nickname');
  }
};
```

- [ ] **步骤 4：Commit**

```bash
git add js/supabase.js
git commit -m "feat: add nickname support to register, login, and update APIs"
```

---

### 任务 3：更新 index.html — 注册表单和顶部显示

**文件：**
- 修改：`index.html`

- [ ] **步骤 1：注册表单增加昵称输入框**

在注册表单（`#register-form`）中，密码输入框下方、注册按钮上方插入昵称输入框：

```html
<!-- 注册表单 -->
<div class="login-form hidden" id="register-form">
  <input type="password" id="register-password" placeholder="设置密码（至少3位）" maxlength="50">
  <!-- ↓ 新增昵称输入框 -->
  <input type="text" id="register-nickname" placeholder="选填，如：小明" maxlength="12">
  <!-- ↑ 新增 -->
  <button class="btn btn-primary" id="btn-register">注册</button>
  <p class="login-error hidden" id="register-error"></p>
</div>
```

- [ ] **步骤 2：顶部账号区域改为可编辑的昵称展示**

当前顶部 subTitle 显示为：

```html
<p class="subtitle">账号 <span id="header-account" style="font-weight:600;letter-spacing:2px;"></span> · 轻松记录每一笔收支</p>
```

修改为昵称展示 + 编辑图标，支持点击编辑：

```html
<p class="subtitle" id="header-subtitle">
  <span id="header-name-display" style="cursor:pointer;font-weight:600;" title="点击修改昵称"></span>
  <span id="header-name-edit-icon" style="cursor:pointer;font-size:11px;color:var(--color-subtext);margin-left:2px;" title="点击修改昵称">✎</span>
  <span id="header-name-editor" style="display:none;">
    <input type="text" id="header-name-input" maxlength="12" style="width:120px;padding:2px 6px;font-size:13px;border:1px solid var(--color-border);border-radius:4px;">
    <button id="header-name-save" style="padding:2px 6px;font-size:12px;cursor:pointer;">💾</button>
    <button id="header-name-cancel" style="padding:2px 6px;font-size:12px;cursor:pointer;">✕</button>
  </span>
  <span> · 轻松记录每一笔收支</span>
</p>
```

- [ ] **步骤 3：Commit**

```bash
git add index.html
git commit -m "feat: add nickname input to register form and editable header"
```

---

### 任务 4：更新 app.js — 昵称显示与编辑交互

**文件：**
- 修改：`js/app.js`

- [ ] **步骤 1：修改登录成功回调，适配新的返回值**

当前 `loginUser` 返回 account 字符串，现改为 `{ account, nickname }` 对象。修改登录按钮逻辑：

```javascript
// 修改前（约第 78 行）：
var matchedAccount = await BK.loginUser(account, password);
if (matchedAccount) {
  BK.setAccountId(matchedAccount);
  ...
}

// 修改后：
var user = await BK.loginUser(account, password);
if (user) {
  BK.setAccountId(user.account);
  if (user.nickname) {
    BK.setNickname(user.nickname);
  }
  ...
}
```

- [ ] **步骤 2：修改注册按钮，传递昵称**

当前调用 `BK.registerUser(password)`。修改为读取昵称输入框：

```javascript
// 修改前：
var result = await BK.registerUser(password);

// 修改后：
var nickname = document.getElementById('register-nickname').value.trim();
var result = await BK.registerUser(password, nickname || undefined);
```

并在注册成功后清空昵称输入框：

```javascript
// 在 registerPassword.value = ''; 之后添加：
document.getElementById('register-nickname').value = '';
```

- [ ] **步骤 3：修改 `showApp` 函数，渲染昵称**

当前代码设置 header-account 文本为账号：

```javascript
var headerAccount = document.getElementById('header-account');
if (headerAccount) headerAccount.textContent = BK.getAccountId();
```

修改为显示昵称或账号回退：

```javascript
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
```

在 `showApp` 中替换原有的 header-account 设置：

```javascript
// 替换：
// var headerAccount = document.getElementById('header-account');
// if (headerAccount) headerAccount.textContent = BK.getAccountId();

// 为：
renderHeaderName();
```

- [ ] **步骤 4：绑定昵称编辑事件**

在 `showApp` 函数末尾（tab 事件绑定之后）添加昵称编辑交互：

```javascript
// ===== 昵称编辑 =====

var nameDisplay = document.getElementById('header-name-display');
var nameEditIcon = document.getElementById('header-name-edit-icon');
var nameEditor = document.getElementById('header-name-editor');
var nameInput = document.getElementById('header-name-input');
var nameSave = document.getElementById('header-name-save');
var nameCancel = document.getElementById('header-name-cancel');

function enterEditMode() {
  var currentNickname = BK.getNickname() || '';
  nameInput.value = currentNickname;
  nameDisplay.style.display = 'none';
  nameEditIcon.style.display = 'none';
  nameEditor.style.display = '';
  nameInput.focus();
}

function exitEditMode() {
  nameDisplay.style.display = '';
  var nickname = BK.getNickname();
  nameEditIcon.style.display = nickname ? '' : 'none';
  nameEditor.style.display = 'none';
}

nameDisplay.addEventListener('click', enterEditMode);
if (nameEditIcon) nameEditIcon.addEventListener('click', enterEditMode);

nameSave.addEventListener('click', async function() {
  var newName = nameInput.value.trim();
  try {
    await BK.updateNickname(newName || null);
    renderHeaderName();
    exitEditMode();
  } catch (e) {
    alert('保存失败：' + e.message);
  }
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
```

- [ ] **步骤 5：清除会话时也清除昵称缓存**

在 `btnLogout` 的 click 处理中，`BK.clearSession()` 已被调用，但 `clearSession` 只清除 `bk_account_id`。修改 `clearSession` 同步清除昵称：

在 `js/supabase.js` 中（如果 `clearSession` 已存在的步骤中处理）：

```javascript
// 修改前：
ns.clearSession = function() {
  localStorage.removeItem('bk_account_id');
};

// 修改后：
ns.clearSession = function() {
  localStorage.removeItem('bk_account_id');
  localStorage.removeItem('bk_nickname');
};
```

- [ ] **步骤 6：Commit**

```bash
git add js/app.js js/supabase.js
git commit -m "feat: implement nickname display and inline editing"
```

---

### 任务 5：端到端验证

**文件：** 无代码变更

- [ ] **步骤 1：部署并手动测试完整流程**

```bash
npx netlify deploy --prod --dir="."
```

测试清单：
1. 打开注册 Tab → 确认有昵称输入框（placeholder: "选填，如：小明"）
2. 输入密码 + 昵称 "测试小明" → 注册 → 确认弹窗显示账号
3. 切换到登录 Tab → 输入账号密码 → 登录 → 顶部显示 "你好，测试小明 ✎"
4. 点击昵称 → 变为输入框 → 改为 "新昵称" → 回车 → 顶部显示 "你好，新昵称 ✎"
5. 刷新页面 → 确认昵称持久化（localStorage + 重新登录后从 Supabase 加载）
6. 清空昵称保存 → 顶部回退显示 "账号 XXXXXXXX"

- [ ] **步骤 2：Commit（如有修正）**

```bash
git add -A
git commit -m "chore: verification fixes for nickname feature"
```
