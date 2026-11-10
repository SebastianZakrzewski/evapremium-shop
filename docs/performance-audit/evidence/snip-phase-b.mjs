import { writeFileSync } from "node:fs"

const home = await (await fetch("http://127.0.0.1:3010/")).text()
const konf = await (await fetch("http://127.0.0.1:3010/konfigurator?brand=audi&model=a4")).text()
const modele = await (await fetch("http://127.0.0.1:3010/modele")).text()

const around = (html, needle) => {
  const index = html.indexOf(needle)
  if (index < 0) return `missing ${needle}`
  return html.slice(Math.max(0, index - 180), index + 220)
}

console.log("--- hero img ---")
console.log(around(home, "zimowa_mobile_hero"))
console.log("--- comparison ---")
console.log(around(home, "eva-mat-comparison"))
console.log("--- fetch ---")
console.log("home fetchPriority", home.includes("fetchPriority"), home.includes("fetchpriority"))
console.log("--- konf audi ---")
console.log(around(konf, "/modele/audi.avif"))
console.log("--- modele grid ---")
console.log(around(modele, "aspect-square"))
console.log("modele loading brands", modele.includes("Ładowanie"), modele.includes("aria-busy"))

writeFileSync("docs/performance-audit/evidence/home-snippet.txt", around(home, "zimowa_mobile_hero"))
