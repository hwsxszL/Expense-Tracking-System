# 用户昵称功能设计

**日期：** 2026-05-31
**状态：** 已批准

## 概述

在现有账号密码登录系统基础上，增加昵称功能：注册时可选填昵称，登录后可点击顶部昵称区域直接编辑，昵称替代账号数字显示。

## 数据库变更

Supabase `users` 表新增列：

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| nickname | TEXT | nullable | 用户昵称，最多 12 字符 |

## API 变更

| 方法 | 端点 | 说明 | 新增/修改 |
|------|------|------|-----------|
| POST | `/rest/v1/users` | 注册时增加 nickname 字段 | 修改 |
| GET | `/rest/v1/users` | 登录查询返回 nickname | 修改 |
| PATCH | `/rest/v1/users?account=eq.<account>` | 更新昵称 | 新增 |

## 前端变更

### 1. 注册表单 (`index.html`)

注册表单增加可选昵称输入框：
- 位置：密码输入框下方
- placeholder: "选填，如：小明"
- maxlength: 12
- 注册时随 account + password_hash 一起提交

### 2. 登录流程 (`js/supabase.js`)

- `registerUser(password, nickname)` — 增加 nickname 参数
- `loginUser(account, password)` — 返回值增加 nickname 字段
- `updateNickname(nickname)` — 新增函数，PATCH 到 Supabase
- `saveNickname(nickname)` — 写入 localStorage `bk_nickname`

### 3. 顶部显示 (`js/app.js` + `index.html`)

- 登录成功后显示昵称替代账号数字
- 无昵称时回退显示 "账号 XXXXXXXX"
- 昵称区域可点击，进入编辑模式

### 4. 昵称编辑 (`js/ui/nickname-editor.js` 或内联在 `app.js`)

- 点击昵称 → 原地替换为输入框 + 保存/取消按钮
- 回车或点保存 → PATCH 到 Supabase → 更新 localStorage → 重渲染
- ESC 或点取消 → 退出编辑模式
- 清空内容保存 → 删除昵称，回退显示账号

## 数据流

```
注册: 表单 → registerUser(password, nickname) → POST /users { account, password_hash, nickname }
登录: 表单 → loginUser(account, password) → GET /users → 返回 { account, nickname }
       → localStorage: bk_account_id, bk_nickname
编辑: 点击 → 输入 → PATCH /users { nickname } → localStorage: bk_nickname → 顶部重渲染
```

## 文件变更清单

| 文件 | 变更 |
|------|------|
| `index.html` | 注册表单加昵称输入框；顶部账号区域改为可编辑的昵称展示 |
| `js/supabase.js` | registerUser 加 nickname 参数；loginUser 返回 nickname；新增 updateNickname |
| `js/app.js` | showApp 中显示昵称；新增昵称编辑交互逻辑 |

## 边界处理

- 昵称最长 12 字符，前端截断
- 昵称可以为空（清空即删除，回退显示账号）
- Supabase PATCH 失败时恢复原显示值并 alert
- 注册时不填昵称 → nickname 为 null，登录后显示账号
