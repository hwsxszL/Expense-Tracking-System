// Verify: delete button immediately removes record from UI
import { chromium } from 'playwright';

const APP_URL = 'http://localhost:8899/index.html';
const SUPABASE_URL = 'https://zztqipetwrguckdvpzsj.supabase.co/rest/v1/';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext();
const page = await context.newPage();

let step = 0;
function log(msg) { console.log(`  [${++step}] ${msg}`); }

try {
  // ============================================================
  // SETUP: intercept Supabase calls with mock data
  // ============================================================
  const MOCK_ACCOUNT = 'test8888';
  const MOCK_TX_ID = 'mock_tx_delete_test';
  const MOCK_CAT_ID = 'preset_test8888_expense_0';

  // Mock categories (returned on GET /categories)
  const mockCategories = [
    { id: MOCK_CAT_ID, account_id: MOCK_ACCOUNT, name: '餐饮', icon: '🍔', type: 'expense', is_preset: true }
  ];

  // Mock transactions (returned on GET /transactions)
  const mockTransactions = [
    { id: MOCK_TX_ID, type: 'expense', amount: 35, category_id: MOCK_CAT_ID, note: '测试午餐', date: '2026-05-31', created_at: '2026-05-31T12:00:00Z' },
    { id: 'mock_tx_002', type: 'expense', amount: 100, category_id: MOCK_CAT_ID, note: '测试购物', date: '2026-05-30', created_at: '2026-05-30T10:00:00Z' }
  ];

  await page.route('**/rest/v1/**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    if (method === 'DELETE' && url.includes('transactions')) {
      log(`Intercepted DELETE transaction → 204`);
      await route.fulfill({ status: 204 });
      return;
    }

    if (method === 'GET' && url.includes('transactions')) {
      log(`Intercepted GET transactions → returning ${mockTransactions.length} records`);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockTransactions)
      });
      return;
    }

    if (method === 'GET' && url.includes('categories')) {
      log(`Intercepted GET categories → returning ${mockCategories.length} categories`);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCategories)
      });
      return;
    }

    if (method === 'POST' && url.includes('transactions')) {
      log(`Intercepted POST transaction → 201`);
      await route.fulfill({ status: 201 });
      return;
    }

    // Fallback: pass through
    await route.continue();
  });

  // ============================================================
  // STEP 1: Navigate to the app
  // ============================================================
  log('Navigating to app...');
  await page.goto(APP_URL, { waitUntil: 'networkidle' });

  // ============================================================
  // STEP 2: Set up logged-in state
  // ============================================================
  log('Setting localStorage account_id...');
  await page.evaluate((account) => {
    localStorage.setItem('bk_account_id', account);
  }, MOCK_ACCOUNT);

  // ============================================================
  // STEP 3: Reload to trigger login flow with mocked data
  // ============================================================
  log('Reloading page with mock login...');
  await page.reload({ waitUntil: 'networkidle' });

  // Wait for the app to render (login screen should be hidden, app visible)
  await page.waitForSelector('#app:not(.hidden)', { timeout: 10000 });
  log('App is visible (logged in)');

  // ============================================================
  // STEP 4: Verify the test transaction is visible
  // ============================================================
  const rowBefore = await page.$(`tr[data-tx-id="${MOCK_TX_ID}"]`);
  if (!rowBefore) {
    console.error('  ❌ FAIL: Test transaction row not found before delete');
    process.exit(1);
  }
  log('Test transaction row visible in the table');

  // Verify we're on the record tab
  const recordTabActive = await page.$eval('.tab-btn[data-tab="record"]', el => el.classList.contains('active'));
  log(`Record tab active: ${recordTabActive}`);

  // ============================================================
  // STEP 5: Click the delete button
  // ============================================================
  const deleteBtn = await page.$(`button.btn-delete[data-id="${MOCK_TX_ID}"]`);
  if (!deleteBtn) {
    console.error('  ❌ FAIL: Delete button not found');
    process.exit(1);
  }
  log('Clicking delete button...');
  await deleteBtn.click();

  // ============================================================
  // STEP 6: Wait for the UI to update (refreshUI should re-render)
  // ============================================================
  // After delete, refreshUI is called which re-renders the entire record tab
  // The old row will be gone because it's no longer in the transactions array
  await page.waitForTimeout(1500); // Give async DB call + re-render time

  // ============================================================
  // STEP 7: Verify the deleted row is gone from the DOM
  // ============================================================
  const rowAfter = await page.$(`tr[data-tx-id="${MOCK_TX_ID}"]`);
  if (rowAfter) {
    console.error('  ❌ FAIL: Deleted row is STILL visible in the DOM!');
    console.error('     The fix did NOT resolve the issue.');
    await page.screenshot({ path: 'tests/delete-fix-fail.png', fullPage: true });
    process.exit(1);
  }
  log('✅ Deleted row is no longer in the DOM — UI updated immediately!');

  // ============================================================
  // STEP 8: Verify the other row is still there
  // ============================================================
  const otherRow = await page.$('tr[data-tx-id="mock_tx_002"]');
  if (!otherRow) {
    console.error('  ⚠️ WARNING: Other transaction row also disappeared (unexpected)');
  } else {
    log('✅ Other transaction row still present (only deleted row removed)');
  }

  // Screenshot for evidence
  await page.screenshot({ path: 'tests/delete-fix-pass.png', fullPage: true });
  log('Screenshot saved to tests/delete-fix-pass.png');

  console.log('\n✅ VERIFICATION PASSED: Delete immediately removes record from UI');
} catch (err) {
  console.error('\n❌ VERIFICATION FAILED:', err.message);
  await page.screenshot({ path: 'tests/delete-fix-error.png', fullPage: true });
  process.exit(1);
} finally {
  await browser.close();
}
