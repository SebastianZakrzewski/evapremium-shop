import { describe, expect, it } from "vitest"
import {
  countMatchingSections,
  sectionMatchesOptionQuery,
} from "./sectionMatchesOptionQuery"

describe("sectionMatchesOptionQuery", () => {
  const structure = {
    title: "Struktura komórek",
    terms: ["Romby", "diamonds", "Plaster miodu", "honey"],
  }
  const color = {
    title: "Kolor materiału",
    terms: ["black", "Czarny", "beige", "Beżowy"],
  }

  it("matches an option name that is not the section title", () => {
    expect(sectionMatchesOptionQuery(structure.title, structure.terms, "romby")).toBe(true)
    expect(sectionMatchesOptionQuery(structure.title, structure.terms, "plaster")).toBe(true)
    expect(sectionMatchesOptionQuery(color.title, color.terms, "black")).toBe(true)
  })

  it("does not match an unrelated section", () => {
    expect(sectionMatchesOptionQuery(color.title, color.terms, "romby")).toBe(false)
  })

  it("counts no sections when nothing matches", () => {
    expect(countMatchingSections([structure, color], "nieistniejaca")).toBe(0)
  })
})
