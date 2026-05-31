// js/transactions.js
window.BK = window.BK || {};

(function(ns) {
  ns.addTransaction = function(transactions, data) {
    var tx = {
      id: ns.generateId(),
      type: data.type,
      amount: Number(data.amount),
      categoryId: data.categoryId,
      note: data.note || '',
      date: data.date,
      createdAt: new Date().toISOString()
    };
    transactions.unshift(tx);
    ns.saveTransactions(transactions);
    return transactions;
  };

  ns.deleteTransaction = function(transactions, id) {
    var filtered = transactions.filter(function(tx) { return tx.id !== id; });
    ns.saveTransactions(filtered);
    return filtered;
  };

  ns.getAllTransactions = function(transactions) {
    return transactions.slice().sort(function(a, b) {
      return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
    });
  };

  ns.filterByMonth = function(transactions, monthKey) {
    return transactions.filter(function(tx) {
      return ns.getMonthKey(tx.date) === monthKey;
    });
  };

  ns.calculateStats = function(transactions, categories, monthKey) {
    var monthTxs = ns.filterByMonth(transactions, monthKey);
    var totalIncome = 0;
    var totalExpense = 0;
    var categoryMap = {};

    monthTxs.forEach(function(tx) {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else {
        totalExpense += tx.amount;
      }

      var key = tx.categoryId;
      if (!categoryMap[key]) {
        var cat = ns.findCategoryById(categories, key);
        categoryMap[key] = {
          categoryId: key,
          categoryName: cat ? cat.name : '未知',
          categoryIcon: cat ? cat.icon : '❓',
          type: tx.type,
          total: 0,
          count: 0
        };
      }
      categoryMap[key].total += tx.amount;
      categoryMap[key].count += 1;
    });

    var byCategory = Object.values(categoryMap).sort(function(a, b) {
      return b.total - a.total;
    });

    return {
      totalIncome: totalIncome,
      totalExpense: totalExpense,
      balance: totalIncome - totalExpense,
      byCategory: byCategory
    };
  };

  ns.getAvailableMonths = function(transactions) {
    var months = {};
    transactions.forEach(function(tx) {
      var key = ns.getMonthKey(tx.date);
      months[key] = true;
    });
    return Object.keys(months).sort().reverse();
  };

  ns.getMonthlyTrend = function(transactions, n) {
    n = n || 6;
    var result = [];
    var now = new Date();
    var currentMonth = ns.currentMonth();

    for (var i = n - 1; i >= 0; i--) {
      var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      var y = d.getFullYear();
      var m = String(d.getMonth() + 1).padStart(2, '0');
      var key = y + '-' + m;
      var monthTxs = ns.filterByMonth(transactions, key);
      var income = 0;
      var expense = 0;
      monthTxs.forEach(function(tx) {
        if (tx.type === 'income') income += tx.amount;
        else expense += tx.amount;
      });
      result.push({ month: m + '月', income: income, expense: expense });
    }
    return result;
  };
})(window.BK);
