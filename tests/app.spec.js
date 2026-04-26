const { test, expect } = require('@playwright/test');

async function login(page) {
  await page.goto('/');
  await page.getByLabel('Username').fill('Barclays_Org');
  await page.getByLabel('Password').fill('PS');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.locator('#mainApp')).toHaveClass(/authenticated/);
  await expect(page.locator('#appVersion')).toContainText('Version v1.4.6');
  await expect(page.locator('#relTableBody tr').first()).toBeVisible();
}

test.describe('power map application', () => {
  test('loads and opens the security audit modal', async ({ page }) => {
    await login(page);

    await page.getByRole('button', { name: 'Security & Audit' }).click();
    await expect(page.locator('#securityModal')).toHaveClass(/open/);
    await expect(page.locator('#currentUserDisplay')).toContainText('GitHub user:');
    await page.getByRole('button', { name: 'Close' }).first().click();
    await expect(page.locator('#securityModal')).not.toHaveClass(/open/);
  });

  test('updates a stakeholder workspace locally and filters by owner', async ({ page }) => {
    await login(page);

    const row = page.locator('#relTableBody tr').filter({ hasText: 'CS Venkatakrishnan' }).first();
    await expect(row).toContainText('Edit details');
    await row.locator('.person-name-button').click();
    await expect(page.locator('#stakeholderModal')).toHaveClass(/open/);
    await expect(page.locator('#stakeholderModalTitle')).toHaveText('CS Venkatakrishnan');
    await expect(page.locator('#workspaceFunction')).toHaveValue('Group Chief Executive Officer');
    await expect(row).toContainText('CEO');

    await page.locator('#workspaceOwner').fill('Test Owner');
    await page.locator('#workspaceRegion').fill('UK');
    await page.locator('#workspaceInfluence').selectOption('5');
    await page.locator('#workspaceSupport').selectOption('Supporter');
    await page.locator('#workspaceObjective').fill('Build executive sponsorship');
    await page.locator('#workspaceNextAction').fill('Schedule sponsor briefing');
    await page.locator('#interactionDate').fill('2026-04-24');
    await page.locator('#interactionSummary').fill('Met to align on funding and sponsorship.');
    await page.getByRole('button', { name: 'Add Interaction' }).click();
    await expect(page.locator('#interactionList')).toContainText('Met to align on funding and sponsorship.');

    await page.getByRole('button', { name: 'Apply to Power Map' }).click();
    await expect(page.locator('#spNotification')).toContainText('Stakeholder workspace updated locally');

    await page.locator('#ownerFilter').selectOption({ label: 'Test Owner' });
    await expect(row).toBeVisible();
  });

  test('switches overlays and opens the executive dashboard', async ({ page }) => {
    await login(page);

    await page.locator('#overlaySelect').selectOption('influence');
    await expect(page.locator('#overlaySelect')).toHaveValue('influence');

    await page.getByRole('button', { name: 'Executive Dashboard' }).click();
    await expect(page.locator('#dashboardModal')).toHaveClass(/open/);
    await expect(page.locator('#dashboardContent')).toContainText('Coverage gaps');
    await expect(page.locator('#dashboardContent')).toContainText('Strongest sponsors');
    await expect(page.locator('#dashboardContent')).toContainText('At-risk accounts');
    await expect(page.locator('#dashboardContent')).toContainText('Inactive critical stakeholders');
    await expect(page.locator('#dashboardContent')).toContainText('AI-assisted insights');
    await expect(page.locator('#dashboardContent')).toContainText('Missing stakeholder coverage');
    await expect(page.locator('#dashboardContent')).toContainText('Next best action:');
  });

  test('previews an org import before applying it', async ({ page }) => {
    await login(page);

    await page.getByRole('button', { name: 'Import Org' }).click();
    await expect(page.locator('#orgImportModal')).toHaveClass(/open/);
    await page.locator('#orgImportInput').fill('Name,Role,Manager\nCS Venkatakrishnan,Group Chief Executive Officer,\nJane Example,Chief of Staff,CS Venkatakrishnan');
    await page.getByRole('button', { name: 'Preview import' }).click();
    await expect(page.locator('#orgImportValidationList')).toContainText('Added: Jane Example');
    await expect(page.locator('#applyOrgImportBtn')).toBeEnabled();
  });

  test('inherits business unit and region defaults from org metadata', async ({ page }) => {
    await login(page);

    const row = page.locator('#relTableBody tr').filter({ hasText: "Antoinette O'Neill" }).first();
    await row.getByRole('button', { name: 'Edit details' }).click();
    await expect(page.locator('#workspaceFunction')).toHaveValue('Chief Operating Officer, CIB');
    await expect(page.locator('#workspaceBusinessUnit')).toHaveValue('CIO');
    await expect(page.locator('#workspaceRegion')).toHaveValue('US');
    await expect(page.locator('select.input-bu-select[data-name="Antoinette O\'Neill"]')).toHaveValue('CIO');
    await expect(page.locator('#workspaceInitiative')).toHaveValue('');
  });

  test('uses inferred branch business units in the BU dropdown and subtree', async ({ page }) => {
    await login(page);

    await expect(page.locator('#buFilter')).toContainText('GTSM');
    await expect(page.locator('#buFilter')).toContainText('CIO');
    await expect(page.locator('#buFilter')).toContainText('USCB');
    await expect(page.locator('#tableBuFilter')).toContainText('GTSM');

    await expect(page.locator('#brandReinventionMetric')).toContainText('Total Enterprise Reinvention');

    const loweRow = page.locator('#relTableBody tr').filter({ hasText: 'Jonathan Lowe' }).first();
    await loweRow.getByRole('button', { name: 'Edit details' }).click();
    await expect(page.locator('select.input-bu-select[data-name="Jonathan Lowe"]')).toHaveValue('GTSM');
    await expect(page.locator('#tableBuFilter')).toHaveValue('');

    await page.locator('#buFilter').selectOption('GTSM');
    await expect(page.locator('#chart')).toContainText('Jonathan Lowe');
    await expect(page.locator('#chart')).toContainText('Paul Austen');
    await expect(page.locator('#chart')).toContainText('Iain MacLeod');
    await expect(page.locator('#chart')).toContainText('Cassandra Waugh');
    await expect(page.locator('#chart')).not.toContainText('Amy Williams');
  });

  test('uses the canonical business unit list and assigns every stakeholder', async ({ page }) => {
    await login(page);

    const expected = ['Audit', 'BUK', 'CFO', 'CIO', 'Compliance', 'Controls', 'COO', 'CRO', 'CTO', 'GFED', 'GTIS', 'GTSM', 'HR', 'IB', 'IT', 'Legal', 'Markets', 'PBWM', 'Risk', 'Strategy', 'UKCB', 'USCB'];
    await expect(page.locator('#loginVersion')).toHaveCSS('font-size', '8px');

    const options = await page.locator('#buFilter option').evaluateAll(nodes => nodes.map(node => node.textContent.trim()).filter(Boolean));
    expect(options).toEqual(['All Business Units', ...expected]);

    const assignments = await page.locator('#relTableBody tr').evaluateAll(rows => rows.map(row => {
      const select = row.querySelector('select.input-bu-select');
      return select ? select.value : '';
    }));
    expect(assignments.every(value => expected.includes(value))).toBeTruthy();

    const workspaceOptions = await page.locator('#workspaceBusinessUnit option').evaluateAll(nodes => nodes.map(node => node.textContent.trim()).filter(Boolean));
    expect(workspaceOptions).toEqual(['Select Business Unit...', ...expected]);
  });

  test('applies executive subtree business unit overrides', async ({ page }) => {
    await login(page);

    const assignments = await page.locator('#relTableBody tr').evaluateAll(rows => Object.fromEntries(rows.map(row => {
      const name = row.getAttribute('data-name');
      const select = row.querySelector('select.input-bu-select');
      return [name, select ? select.value : ''];
    })));

    expect(assignments['Anna Cross']).toBe('CFO');
    expect(assignments['Steven Ewart']).toBe('CFO');
    expect(assignments['Adeel Khan']).toBe('Markets');
    expect(assignments['Michael Webb']).toBe('Markets');
    expect(assignments['Jonathan Lowe']).toBe('GTSM');
    expect(assignments['Paul Austen']).toBe('GTSM');
    expect(assignments['Taalib Shaah']).toBe('CRO');
    expect(assignments['Kirsty Fitzgerald']).toBe('CRO');
    expect(assignments['Tristram Roberts']).toBe('HR');
    expect(assignments['Louisa Chapple']).toBe('HR');
    expect(assignments['Matt Hammerstein']).toBe('UKCB');
    expect(assignments['Denny Nealon']).toBe('USCB');
    expect(assignments['Vim Maru']).toBe('BUK');
    expect(assignments['Nicola Eggers']).toBe('BUK');
    expect(assignments['Sasha Wiggins']).toBe('PBWM');
    expect(assignments['Jane Sedgwick']).toBe('PBWM');
    expect(assignments['Amy Williams']).toBe('GTIS');
    expect(assignments['David Richards']).toBe('GTIS');
    expect(assignments['Matthew Fitzwater']).toBe('Compliance');
    expect(assignments['Christopher Singh']).toBe('Compliance');
    expect(assignments['Stephen Shapiro']).toBe('Legal');
    expect(assignments['David Mackenzie']).toBe('Legal');
    expect(assignments['Wally Adeyemo']).toBe('Strategy');
    expect(assignments['Tom Hoskin']).toBe('Strategy');
  });
});