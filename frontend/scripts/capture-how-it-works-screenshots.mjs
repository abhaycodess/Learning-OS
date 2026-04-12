import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const outputDir = path.join(projectRoot, 'public', 'how-it-works')
const baseUrl = 'http://localhost:5174'

const creds = {
  firstName: 'Visual',
  lastName: 'Tour',
  email: `visual.tour.${Date.now()}@learningos.dev`,
  password: 'StrongPass123',
}

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function tryDemoLogin(page) {
  await page.goto(`${baseUrl}/auth`, { waitUntil: 'domcontentloaded' })
  await page.fill('input[name="email"]', 'demo@learning.os')
  await page.fill('input[name="password"]', 'demo123')
  await page.locator('form').getByRole('button', { name: /^Sign In$/ }).click()
  await wait(2000)
  return !page.url().includes('/auth')
}

async function signupAndLogin(page) {
  await page.goto(`${baseUrl}/auth`, { waitUntil: 'domcontentloaded' })

  await page.getByRole('button', { name: 'Create Account' }).first().click()
  await page.fill('input[name="firstName"]', creds.firstName)
  await page.fill('input[name="lastName"]', creds.lastName)
  await page.fill('input[name="email"]', creds.email)
  await page.fill('input[name="password"]', creds.password)
  await page.fill('input[name="confirmPassword"]', creds.password)
  await page.check('input[name="agreeToTerms"]')
  await page.locator('form').getByRole('button', { name: /^Create Account$/ }).click()

  await wait(2500)

  if (page.url().includes('/verify-email')) {
    await page.getByRole('button', { name: /Verify Email/i }).click()
    await wait(2000)
    await page.goto(`${baseUrl}/auth`, { waitUntil: 'domcontentloaded' })
    await page.fill('input[name="email"]', creds.email)
    await page.fill('input[name="password"]', creds.password)
    await page.locator('form').getByRole('button', { name: /^Sign In$/ }).click()
    await wait(2200)
  }
}

async function completeOnboardingIfNeeded(page) {
  if (!page.url().includes('/onboarding')) return

  await wait(700)

  const clickAndNext = async (selectorToClick) => {
    if (selectorToClick) {
      await page.getByRole('button', { name: selectorToClick }).first().click()
    }
    await page.getByRole('button', { name: 'Next' }).click()
    await wait(350)
  }

  await page.fill('input[name="name"]', `${creds.firstName} ${creds.lastName}`)
  await page.getByRole('button', { name: /School Student/i }).click()
  await page.getByRole('button', { name: 'Next' }).click()

  await wait(350)
  await clickAndNext(/Crack an exam/i)
  await clickAndNext(/Mathematics/i)

  await page.getByRole('button', { name: /1-2 hours/i }).click()
  await page.getByRole('button', { name: /Morning/i }).click()
  await page.getByRole('button', { name: 'Next' }).click()

  await wait(350)
  await clickAndNext(/Procrastination/i)
  await clickAndNext(/Watching videos/i)

  await page.fill('input[name="dailyGoal"]', '2 hours daily')
  await page.getByRole('button', { name: 'Next' }).click()

  await wait(400)
  await page.getByRole('button', { name: /Go to Dashboard/i }).click()
  await page.waitForURL(/dashboard/, { timeout: 20000 })
  await wait(900)
}

async function captureRoutes(page) {
  const captures = [
    { route: '/dashboard', file: 'dashboard.png' },
    { route: '/tasks', file: 'tasks.png' },
    { route: '/focus', file: 'focus.png' },
    { route: '/analytics', file: 'analytics.png' },
  ]

  for (const entry of captures) {
    await page.goto(`${baseUrl}${entry.route}`, { waitUntil: 'domcontentloaded' })
    await wait(1500)
    await page.screenshot({ path: path.join(outputDir, entry.file), fullPage: false })
    console.log(`Captured ${entry.file}`)
  }
}

async function run() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1512, height: 920 } })
  const page = await context.newPage()

  try {
    const demoWorked = await tryDemoLogin(page)
    if (!demoWorked) {
      await signupAndLogin(page)
    }

    await completeOnboardingIfNeeded(page)
    await captureRoutes(page)
  } finally {
    await browser.close()
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
