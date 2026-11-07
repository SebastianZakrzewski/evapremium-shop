import { execSync } from "node:child_process"
import fs from "node:fs"
import puppeteer from "puppeteer-core"

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:3456"
const chrome = process.env.CHROME_PATH || execSync(
  "command -v google-chrome || command -v google-chrome-stable || command -v chromium || command -v chromium-browser",
  { encoding: "utf8", shell: true },
).trim().split("\n").filter(Boolean).pop()

const notes = []
const log = (m) => { notes.push(m); console.log(m) }
const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
})
const page = await browser.newPage()
const writes = []
const pageErrors = []
const consoleErrors = []
page.on("pageerror", (err) => pageErrors.push(String(err)))
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text().slice(0, 240))
})
await page.setRequestInterception(true)
page.on("request", (req) => {
  const url = req.url()
  if (req.method() !== "GET" && req.method() !== "HEAD" && /\/api\/(orders|payments|bitrix|cart|abandoned)/.test(url)) {
    writes.push(`${req.method()} ${url}`)
  }
  if (/cookiebot|googletagmanager|google-analytics|facebook|clarity\.ms|doubleclick|paynow|przelewy24|bitrix24/.test(url)) req.abort()
  else req.continue()
})
await page.setViewport({ width: 1280, height: 900 })

const dismissConsent = async () => {
  const buttons = await page.$$("button")
  for (const button of buttons) {
    const text = await page.evaluate((el) => el.innerText, button)
    if (text.includes("Odrzuć")) {
      await button.click()
      await new Promise((r) => setTimeout(r, 300))
      return
    }
  }
}

const pick = async (aria, labelPart) => {
  const button = await page.waitForSelector(`button[aria-label="${aria}"]:not([disabled])`, { timeout: 10000 })
  await button.evaluate((el) => el.scrollIntoView({ block: "center" }))
  await button.click()
  await page.waitForSelector(`[role="listbox"][aria-label="${aria}"]`, { timeout: 5000 })
  const options = await page.$$(`[role="listbox"][aria-label="${aria}"] [role="option"]`)
  const seen = []
  for (const option of options) {
    const text = (await page.evaluate((el) => el.innerText, option)).replace(/\s+/g, " ").trim()
    seen.push(text)
    if (text.includes(labelPart)) {
      await option.click()
      log(`pick ${aria} -> ${text}`)
      await new Promise((r) => setTimeout(r, 250))
      return
    }
  }
  throw new Error(`no option ${labelPart} in ${aria}: ${seen.join(" | ")}`)
}

const clickText = async (needle) => {
  const clicked = await page.evaluate((wanted) => {
    const buttons = [...document.querySelectorAll("button")]
    const match = buttons.find((el) => !el.disabled && el.innerText.includes(wanted))
    if (!match) return ""
    match.scrollIntoView({ block: "center" })
    match.click()
    return match.innerText.replace(/\s+/g, " ").trim().slice(0, 80)
  }, needle)
  if (!clicked) throw new Error(`button not found: ${needle}`)
  log(`click ${clicked}`)
  await new Promise((r) => setTimeout(r, 350))
  return clicked
}

try {
  await page.goto(`${baseUrl}/konfigurator`, { waitUntil: "networkidle2", timeout: 30000 })
  await dismissConsent()
  await pick("Marka", "Hyundai")
  await pick("Model", "Tucson")
  await pick("Generacja", "2020")
  await pick("Rok produkcji", "2024")
  await pick("Skrzynia biegów", "Automatyczna")
  await pick("Typ nadwozia", "SUV")
  await clickText("3D z rantami")
  await clickText("Przód")
  let body = await page.evaluate(() => document.body.innerText)
  log(`price-front-319 ${body.includes("319,00")}`)
  await clickText("Przód + tył")
  body = await page.evaluate(() => document.body.innerText)
  log(`price-basic-559 ${body.includes("559,00")}`)
  await clickText("Romby")
  const color = await page.$("#section-color button")
  if (!color) throw new Error("no material color")
  const colorLabel = await page.evaluate((el) => el.getAttribute("aria-label"), color)
  await color.click()
  log(`color ${colorLabel}`)
  await new Promise((r) => setTimeout(r, 200))
  const edge = await page.$("#section-edgeColor button")
  if (!edge) throw new Error("no edge color")
  const edgeLabel = await page.evaluate((el) => el.getAttribute("aria-label"), edge)
  await edge.click()
  log(`edge ${edgeLabel}`)
  await new Promise((r) => setTimeout(r, 300))
  await clickText("Podsumowanie zamówienia")
  await clickText("Przejdź do koszyka")
  await page.waitForFunction(() => (localStorage.getItem("cart-v2") || "").includes("Tucson"), { timeout: 8000 })
  const cart1 = JSON.parse(await page.evaluate(() => localStorage.getItem("cart-v2")))
  const qty1 = cart1.items?.[0]?.quantity ?? cart1[0]?.quantity
  log(`cart-after-add qty=${qty1} name=${JSON.stringify(cart1).slice(0, 180)}`)
  await page.reload({ waitUntil: "domcontentloaded" })
  const cartReload = await page.evaluate(() => localStorage.getItem("cart-v2"))
  log(`cart-persists-reload ${cartReload.includes("Tucson")}`)
  await page.evaluate(() => document.querySelectorAll("button").forEach((el) => {
    if (el.querySelector("svg") && el.closest("nav, header, .glass-button, div")) return
  }))
  const cartButtons = await page.$$("button")
  let opened = false
  for (const button of cartButtons) {
    const svg = await page.evaluate((el) => !!el.querySelector("svg path[d*='M16 11V7']"), button)
    if (svg) {
      await button.click()
      opened = true
      break
    }
  }
  log(`cart-modal-click ${opened}`)
  await page.waitForSelector('[aria-label="Zwiększ ilość"]', { timeout: 5000 })
  await page.evaluate(() => {
    const button = [...document.querySelectorAll('[aria-label="Zwiększ ilość"]')]
      .find((el) => el.getClientRects().length > 0)
    button?.click()
  })
  await new Promise((r) => setTimeout(r, 800))
  const qty2 = await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem("cart-v2"))
    return raw.items?.[0]?.quantity ?? raw[0]?.quantity
  })
  log(`qty-after-plus ${qty2}`)
  await page.reload({ waitUntil: "domcontentloaded" })
  const qty3 = await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem("cart-v2"))
    return raw.items?.[0]?.quantity ?? raw[0]?.quantity
  })
  log(`qty-persists ${qty3}`)

  await page.goto(`${baseUrl}/checkout`, { waitUntil: "networkidle2", timeout: 25000 })
  await dismissConsent()
  const nextState = async () => {
    const buttons = await page.$$("button")
    for (const button of buttons) {
      const text = (await page.evaluate((el) => el.innerText, button)).trim()
      if (text === "Dalej" || text.endsWith("Dalej")) {
        return page.evaluate((el) => el.disabled, button)
      }
    }
    return null
  }
  log(`checkout-next-disabled-empty ${await nextState()}`)
  log(`still-checkout-before-fill ${page.url().includes("/checkout")}`)
  await page.type("#firstName", "Anna")
  await page.type("#lastName", "Test")
  await page.type("#email", "anna@example.com")
  await page.type("#phone", "500600700")
  log(`checkout-next-disabled-filled ${await nextState()}`)
  await page.evaluate(() => {
    const button = [...document.querySelectorAll("button")].find((el) => el.innerText.includes("Dalej") && !el.disabled)
    button?.click()
  })
  await page.waitForSelector("#street", { timeout: 5000 })
  log(`address-step true`)
  log(`address-next-disabled-empty ${await nextState()}`)
  await page.type("#street", "Testowa 1")
  await page.type("#postalCode", "00-001")
  await page.type("#city", "Warszawa")
  await page.evaluate(() => {
    const button = [...document.querySelectorAll("button")].find((el) => el.innerText.includes("Dalej") && !el.disabled)
    button?.click()
  })
  await page.waitForSelector("#termsAccepted", { timeout: 5000 })
  const submitDisabled = await page.$eval("button[type=submit]", (el) => el.disabled)
  log(`pay-step-submit-present ${submitDisabled === false}`)
  await page.evaluate(() => document.querySelector("button[type=submit]")?.click())
  await new Promise((r) => setTimeout(r, 400))
  log(`pay-without-terms-stays ${page.url().includes("/checkout")}`)

  await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" })
  const cartButtons2 = await page.$$("button")
  for (const button of cartButtons2) {
    const svg = await page.evaluate((el) => !!el.querySelector("svg path[d*='M16 11V7']"), button)
    if (svg) { await button.evaluate((el) => el.click()); break }
  }
  await page.waitForSelector('[aria-label="Usuń z koszyka"]', { timeout: 5000 })
  await page.evaluate(() => {
    const button = [...document.querySelectorAll('[aria-label="Usuń z koszyka"]')]
      .find((el) => el.getClientRects().length > 0)
    button?.click()
  })
  await new Promise((r) => setTimeout(r, 500))
  await page.reload({ waitUntil: "domcontentloaded" })
  const afterRemove = await page.evaluate(() => localStorage.getItem("cart-v2") || "")
  log(`removed-persists ${afterRemove.includes("Tucson") ? "still-present" : "gone"}`)
  log(`writes ${writes.length} ${writes.join(" | ")}`)
  log(`pageerrors ${pageErrors.length} ${pageErrors.slice(0, 3).join(" || ")}`)
  const appConsole = consoleErrors.filter((text) => !text.includes("Failed to load resource") && !text.includes("net::ERR"))
  log(`consoleerrors ${appConsole.length}`)
  appConsole.forEach((text, index) => log(`consoleerror ${index + 1}: ${text}`))
} catch (error) {
  log(`FAIL ${error.message}`)
  if (process.env.JOURNEY_FAIL_SHOT) {
    await page.screenshot({ path: process.env.JOURNEY_FAIL_SHOT }).catch(() => {})
  }
}
if (process.env.JOURNEY_LOG) fs.writeFileSync(process.env.JOURNEY_LOG, notes.join("\n"))
await browser.close()
