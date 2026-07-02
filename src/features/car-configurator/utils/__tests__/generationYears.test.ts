import { describe, expect, it } from "vitest"
import { getYearsFromGenerations } from "../generationYears"

describe("getYearsFromGenerations", () => {
  const generations = [
    { generation: "1998-2005", yearFrom: 1998, yearTo: 2005, bodyType: "kombi" },
    { generation: "1998-2005", yearFrom: 1998, yearTo: 2005, bodyType: "cabrio" },
    { generation: "2006-2011", yearFrom: 2006, yearTo: 2011, bodyType: "sedan" },
  ]

  it("returns all years across generations when label omitted", () => {
    expect(getYearsFromGenerations(generations)).toEqual([
      2011, 2010, 2009, 2008, 2007, 2006, 2005, 2004, 2003, 2002, 2001, 2000, 1999, 1998,
    ])
  })

  it("filters years to matching generation label", () => {
    expect(getYearsFromGenerations(generations, "1998-2005")).toEqual([
      2005, 2004, 2003, 2002, 2001, 2000, 1999, 1998,
    ])
  })
})
