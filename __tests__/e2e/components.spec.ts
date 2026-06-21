import { test, expect } from "@playwright/test"

test.describe("UI Components E2E", () => {
  test.beforeEach(async ({ page }) => {
    page.on("console", (msg) => console.log("BROWSER LOG:", msg.text()))
    page.on("pageerror", (err) => console.error("BROWSER ERROR:", err))

    // Go to the home page
    await page.goto("/")
    // Wait for Next.js hydration to fully complete
    await page.waitForTimeout(3000)
  })

  test("should render the main header", async ({ page }) => {
    await expect(page.locator("h1", { hasText: "Social Skills Coach" })).toBeVisible()
    await expect(page.getByText("Practice and improve your social interactions")).toBeVisible()
  })

  test("settings dialog opens and works", async ({ page }) => {
    // Click settings button
    await page.getByText("Settings", { exact: true }).click()

    // Expect dialog to open
    const dialogTitle = page.getByText("AI Provider Settings")
    await expect(dialogTitle).toBeVisible()

    // Close by pressing escape
    await page.keyboard.press("Escape")
  })

  test("theme toggle button exists", async ({ page }) => {
    const themeBtn = page.getByRole("button", { name: "Toggle theme" })
    await expect(themeBtn).toBeVisible()
    await themeBtn.click() // ensure it's clickable
  })

  test("tabs can be switched", async ({ page }) => {
    const analyzerTab = page.getByText("1. Analyzer", { exact: true })
    const coachTab = page.getByText("2. Coach", { exact: true })
    const roleplayTab = page.getByText("3. Role-Play", { exact: true })
    const reflectionTab = page.getByText("4. Reflection", { exact: true })

    await expect(analyzerTab).toBeVisible()

    // Switch to Coach tab
    await coachTab.click()
    await expect(page.getByText("Get concrete advice on what to say and do.")).toBeVisible()

    // Switch to Roleplay tab
    await roleplayTab.click()
    await expect(
      page.getByText("Practice the conversation. I will play the other person.")
    ).toBeVisible()

    // Switch to Reflection tab
    await reflectionTab.click()
    await expect(page.getByText("Review your practice and get feedback.")).toBeVisible()
  })

  test("input field takes text", async ({ page }) => {
    const input = page.getByPlaceholder(/Type your message/i)
    await expect(input).toBeVisible()

    await input.fill("Hello World")
    await expect(input).toHaveValue("Hello World")
  })
})
