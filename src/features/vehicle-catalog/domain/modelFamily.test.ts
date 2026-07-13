import { describe, expect, it } from "vitest"
import { deriveModelFamily } from "./modelFamily"

describe("deriveModelFamily", () => {
  it.each([
    ["ranger_4_gen", "ranger", "Ranger"],
    ["ranger_raptor_6_gen", "ranger_raptor", "Ranger Raptor"],
    ["vito_3_gen_w447", "vito", "Vito"],
    ["c4_picasso_ii_gen", "c4_picasso", "C4 Picasso"],
    ["500l_1_gen", "500l", "500L"],
    ["model_x", "model_x", "Model X"],
  ])("groups %s as %s", (modelKey, expectedKey, expectedName) => {
    expect(deriveModelFamily(modelKey)).toEqual({
      key: expectedKey,
      name: expectedName,
    })
  })

  it("keeps Ranger and Ranger Raptor as separate families", () => {
    expect(deriveModelFamily("ranger_6_gen").key).not.toBe(
      deriveModelFamily("ranger_raptor_6_gen").key,
    )
  })
})
