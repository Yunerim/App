export default async function run(page, ui) {
  const before = await ui.snapshot();
  await page.click('#cookie');
  await page.waitForTimeout(600);
  const after = await ui.snapshot();
  const bittenVisible = await page.evaluate(() => {
    const b = document.getElementById('bitten');
    return b && !b.classList.contains('hidden');
  });
  const count = await page.evaluate(() => document.getElementById('count').textContent);
  // second click should not increment
  await page.evaluate(() => document.getElementById('cookie').click());
  const countAfter2 = await page.evaluate(() => document.getElementById('count').textContent);
  return { before, bittenVisible, count, countAfter2, after };
}
