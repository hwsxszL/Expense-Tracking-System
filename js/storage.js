// js/storage.js — Supabase 云存储
window.BK = window.BK || {};

(function(ns) {
  function uf() {
    var accountId = ns.getAccountId();
    if (!accountId) throw new Error('未登录');
    return 'account_id=eq.' + accountId;
  }

  // ===== 交易记录 =====

  ns.loadTransactions = async function() {
    var data = await ns.supabaseFetch('GET', 'transactions', {
      select: '*', filter: uf(), order: 'date.desc,created_at.desc'
    });
    return (data || []).map(function(t) {
      return {
        id: t.id, type: t.type, amount: Number(t.amount),
        categoryId: t.category_id, note: t.note || '',
        date: t.date, createdAt: t.created_at
      };
    });
  };

  ns.insertTransaction = async function(tx) {
    await ns.supabaseFetch('POST', 'transactions', {
      body: tx, prefer: 'return=minimal'
    });
  };

  ns.deleteTransactionRecord = async function(id) {
    await ns.supabaseFetch('DELETE', 'transactions', {
      filter: uf() + ',id=eq.' + encodeURIComponent(id), prefer: 'return=minimal'
    });
  };

  // ===== 分类 =====

  ns.loadCategories = async function() {
    var data = await ns.supabaseFetch('GET', 'categories', {
      select: '*', filter: uf(), order: 'id.asc'
    });
    return data || [];
  };

  ns.insertCategory = async function(cat) {
    await ns.supabaseFetch('POST', 'categories', {
      body: cat, prefer: 'return=minimal'
    });
  };

  ns.updateCategoryRecord = async function(id, updates) {
    await ns.supabaseFetch('PATCH', 'categories', {
      filter: uf() + ',id=eq.' + encodeURIComponent(id),
      body: updates,
      prefer: 'return=minimal'
    });
  };

  ns.deleteCategoryRecord = async function(id) {
    await ns.supabaseFetch('DELETE', 'categories', {
      filter: uf() + ',id=eq.' + encodeURIComponent(id), prefer: 'return=minimal'
    });
  };

  // 批量插入（单次请求，原子操作）
  ns.insertCategoriesBatch = async function(cats) {
    await ns.supabaseFetch('POST', 'categories', {
      body: cats, prefer: 'return=minimal'
    });
  };

  // 批量更新交易记录的 categoryId
  ns.migrateTransactionsCategory = async function(fromId, toId) {
    var txs = await ns.supabaseFetch('GET', 'transactions', {
      select: 'id', filter: uf() + ',category_id=eq.' + encodeURIComponent(fromId)
    });
    for (var i = 0; i < (txs || []).length; i++) {
      await ns.supabaseFetch('PATCH', 'transactions', {
        filter: uf() + ',id=eq.' + encodeURIComponent(txs[i].id),
        body: { category_id: toId },
        prefer: 'return=minimal'
      });
    }
  };
})(window.BK);
