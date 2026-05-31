# 记账小系统

轻量级个人记账 Web 应用，纯前端 + localStorage，无需后端。

## 功能

- 📝 收支记录录入（类型、金额、分类、日期、备注）
- 📋 流水列表查看与删除
- 🏷️ 分类管理（13 个预设 + 自定义增删）
- 📊 月度统计（收支概览、趋势柱状图、分类饼图、排行）

## 使用方式

直接在浏览器中打开 `index.html` 即可使用。

## 技术栈

- Vanilla JS（无框架）
- 纯 CSS（CSS 变量）
- Chart.js 4.x（CDN）
- localStorage 持久化

## 项目结构

```
bookkeeping/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js              # 入口、Tab 切换
│   ├── storage.js           # localStorage 封装
│   ├── utils.js             # 工具函数
│   ├── categories.js        # 分类业务逻辑
│   ├── transactions.js      # 交易记录逻辑
│   └── ui/
│       ├── record.js        # 记账页 UI
│       ├── stats.js         # 统计页 UI
│       └── category-manager.js  # 分类管理弹窗
├── tests/
│   ├── test.html
│   ├── test-utils.js
│   ├── test-storage.js
│   ├── test-categories.js
│   └── test-transactions.js
└── README.md
```
