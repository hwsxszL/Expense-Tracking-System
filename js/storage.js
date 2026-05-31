// js/storage.js
window.BK = window.BK || {};

(function(ns) {
  var TX_KEY = 'bk_transactions';
  var CAT_KEY = 'bk_categories';

  ns.loadTransactions = function() {
    try {
      var data = localStorage.getItem(TX_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  };

  ns.saveTransactions = function(transactions) {
    localStorage.setItem(TX_KEY, JSON.stringify(transactions));
  };

  ns.loadCategories = function() {
    try {
      var data = localStorage.getItem(CAT_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  };

  ns.saveCategories = function(categories) {
    localStorage.setItem(CAT_KEY, JSON.stringify(categories));
  };

  ns.clearAll = function() {
    localStorage.removeItem(TX_KEY);
    localStorage.removeItem(CAT_KEY);
  };
})(window.BK);
