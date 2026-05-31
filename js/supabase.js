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
   * 生成随机 8 位数字账号（首位不为 0）
   */
  ns.generateAccountNumber = function() {
    var first = String(Math.floor(Math.random() * 9) + 1);
    var rest = '';
    for (var i = 0; i < 7; i++) {
      rest += Math.floor(Math.random() * 10);
    }
    return first + rest;
  };

  /**
   * 注册新用户：生成账号、哈希密码、写入 users 表
   * 返回 { account, passwordHash }
   */
  ns.registerUser = async function(password, nickname) {
    var account = ns.generateAccountNumber();
    var passwordHash = await ns.hashPassphrase(password);

    var maxRetries = 5;
    for (var attempt = 0; attempt < maxRetries; attempt++) {
      try {
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
        return { account: account, passwordHash: passwordHash };
      } catch (e) {
        if (e.message.indexOf('409') !== -1 || e.message.indexOf('duplicate') !== -1) {
          account = ns.generateAccountNumber();
          continue;
        }
        throw e;
      }
    }
    throw new Error('账号生成失败，请重试');
  };

  /**
   * 登录验证：查询 users 表匹配账号和密码哈希
   * 返回账号 ID 或 null
   */
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

  /**
   * 获取当前登录账号
   */
  ns.getAccountId = function() {
    return localStorage.getItem('bk_account_id');
  };

  /**
   * 设置登录账号
   */
  ns.setAccountId = function(accountId) {
    localStorage.setItem('bk_account_id', accountId);
  };

  /**
   * 清除会话
   */
  ns.clearSession = function() {
    localStorage.removeItem('bk_account_id');
    localStorage.removeItem('bk_nickname');
  };

  /**
   * 更新用户昵称（PATCH 到 Supabase + 更新 localStorage）
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
      // 逗号分隔多个过滤条件，每个作为独立 URL 参数（AND 逻辑）
      options.filter.split(',').forEach(function(f) {
        params.push(f.trim());
      });
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
    // 204 或空响应体直接返回 null
    if (response.status === 204) return null;
    var text = await response.text();
    if (!text) return null;
    return JSON.parse(text);
  };
})(window.BK);
