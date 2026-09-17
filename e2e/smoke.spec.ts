import { expect, test } from '@playwright/test';

// 冒烟级 e2e：验证核心页面可达、关键内容渲染、终端可交互。
// 运行：npm run dev 后执行 npx playwright test（或直接 npx playwright test，会自动起 dev server）。

test('首页正常加载', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/首页|Git/);
});

test('教程列表包含新课程', async ({ page }) => {
  await page.goto('/tutorials');
  await expect(page.getByText('修改最近一次提交（amend）').first()).toBeVisible();
  await expect(page.getByText('Git hooks：让检查自动执行').first()).toBeVisible();
});

test('教程详情页渲染正文', async ({ page }) => {
  await page.goto('/tutorials/git-amend');
  await expect(page.getByRole('heading', { name: '修改最近一次提交（amend）' })).toBeVisible();
  await expect(page.getByText('唯一的红线：别改已推送的提交')).toBeVisible();
});

test('练习列表与概念练习可达', async ({ page }) => {
  await page.goto('/practice');
  await expect(page.getByText('理解二分查找的定位思路').first()).toBeVisible();
  await page.goto('/practice/bisect-intro');
  await expect(page.getByText('这是概念练习，不提供图形模拟，也不计入完成进度。').first()).toBeVisible();
});

test('动画页渲染 tag 场景', async ({ page }) => {
  await page.goto('/animations');
  await expect(page.getByText('给发布提交钉上版本标签').first()).toBeVisible();
});

test('沙盒终端可执行 git 命令', async ({ page }) => {
  await page.goto('/sandbox');
  const input = page.getByLabel('输入 Git 命令');
  await input.click();
  await input.fill('git status');
  await input.press('Enter');
  await expect(page.getByText('位于分支 main').first()).toBeVisible();
});
