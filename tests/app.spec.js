const { test, expect } = require('@playwright/test');

async function login(page) {
  await page.goto('/');
  await page.getByLabel('Username').fill('Barclays_Org');
  await page.getByLabel('Password').fill('PS');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page.locator('#mainApp')).toHaveClass(/authenticated/);
  await expect(page.locator('#appVersion')).toContainText('Version v1.4.4');
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
    await row.getByRole('button', { name: 'Edit details' }).click();
    await expect(page.locator('#stakeholderModal')).toHaveClass(/open/);
    await expect(page.locator('#stakeholderModalTitle')).toHaveText('CS Venkatakrishnan');
    await expect(page.locator('#workspaceFunction')).toHaveValue('Group Chief Executive Officer');

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
    await expect(page.locator('#workspaceRegion')).toHaveValue('US');
    await expect(page.locator('input.input-bu[data-name="Antoinette O\'Neill"]')).toHaveValue('CIO');
    await expect(page.locator('#workspaceInitiative')).toHaveValue('');
  });

  test('uses inferred branch business units in the BU dropdown and subtree', async ({ page }) => {
    await login(page);

    await expect(page.locator('#buFilter')).toContainText('GTSM');
    await expect(page.locator('#buFilter')).toContainText('Chief Technology Office');

    const loweRow = page.locator('#relTableBody tr').filter({ hasText: 'Jonathan Lowe' }).first();
    await loweRow.getByRole('button', { name: 'Edit details' }).click();
    await expect(page.locator('input.input-bu[data-name="Jonathan Lowe"]')).toHaveValue('GTSM');
  });
});