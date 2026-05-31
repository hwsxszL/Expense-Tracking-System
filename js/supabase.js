// js/supabase.js
window.BK = window.BK || {};

(function(ns) {
  var SUPABASE_URL = 'https://zztqipetwrguckdvpzsj.supabase.co';
  var ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6dHFpcGV0d3JndWNrZHZwenNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMDg0MzUsImV4cCI6MjA5NTc4NDQzNX0.KRL4kUekplx-mbkOkI4UbQFiqnzFhYo-ZAYt556t_NE';

  /**
   * 用 SHA-256 对密码做哈希
   */
  ns.hashPassphrase = async function(passphrase) {
    var encoder = new TextEncoder();
    var data = encoder.encode(passphrase);
    var hash = await crypto.subtle.digest('SHA-256', data);
    var arr = Array.from(new Uint8Array(hash));
    return arr.map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
  };

  /**
   * 获取当前用户哈希（存在 sessionStorage）
   */
  ns.getUserHash = function() {
    return sessionStorage.getItem('bk_passphrase_hash');
  };

  /**
   * 设置用户哈希
   */
  ns.setUserHash = function(hash) {
    sessionStorage.setItem('bk_passphrase_hash', hash);
  };

  /**
   * 清除会话
   */
  ns.clearSession = function() {
    sessionStorage.removeItem('bk_passphrase_hash');
  };

  /**
   * 发送 Supabase REST 请求
   */
  ns.supabaseFetch = async function(method, table, options) {
    options = options || {};
    var url = SUPABASE_URL + '/rest/v1/' + table;
    var headers = {
      'apikey': ANON_KEY,
      'Authorization': 'Bearer ' + ANON_KEY,
      'Content-Type': 'application/json',
      'Prefer': options.prefer || 'return=representation'
    };

    // 构建查询参数
    var params = [];
    if (options.select) {
      params.push('select=' + encodeURIComponent(options.select));
    }
    if (options.filter) {
      params.push(options.filter);
    }
    if (options.order) {
      params.push('order=' + encodeURIComponent(options.order));
    }
    if (options.limit) {
      params.push('limit=' + options.limit);
    }
    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    var fetchOptions = { method: method, headers: headers };
    if (options.body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(options.body);
    }

    var response = await fetch(url, fetchOptions);
    if (!response.ok) {
      var errText = await response.text();
      throw new Error('Supabase error ' + response.status + ': ' + errText);
    }
    if (response.status === 204) return null;
    return response.json();
  };
})(window.BK);
