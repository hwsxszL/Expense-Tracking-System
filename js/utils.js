window.BK = window.BK || {};

(function(ns) {
  ns.formatCurrency = function(amount, type) {
    const fixed = Math.abs(amount).toFixed(2);
    return type === 'income' ? '+' + fixed : '-' + fixed;
  };

  ns.generateId = function() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  };

  ns.getMonthKey = function(dateStr) {
    return dateStr.slice(0, 7);
  };

  ns.getMonthRange = function(monthKey) {
    const [y, m] = monthKey.split('-').map(Number);
    const start = monthKey + '-01';
    const lastDay = new Date(y, m, 0).getDate();
    const end = monthKey + '-' + String(lastDay).padStart(2, '0');
    return { start, end };
  };

  ns.today = function() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  };

  ns.currentMonth = function() {
    return ns.getMonthKey(ns.today());
  };

  ns.formatDate = function(dateStr) {
    const parts = dateStr.split('-');
    return parseInt(parts[1]) + '月' + parseInt(parts[2]) + '日';
  };
})(window.BK);
