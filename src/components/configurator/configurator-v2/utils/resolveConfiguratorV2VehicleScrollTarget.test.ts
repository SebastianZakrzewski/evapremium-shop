import { describe, expect, it } from "vitest"
import { resolveConfiguratorV2VehicleScrollTarget } from "./resolveConfiguratorV2VehicleScrollTarget"
import {
  LOCKED_VEHICLE_BODY_TYPE_FIELD_ID,
  LOCKED_VEHICLE_YEAR_FIELD_ID,
  VEHICLE_BODY_TYPE_FIELD_ID,
  VEHICLE_YEAR_FIELD_ID,
} from "./configuratorV2VehicleFieldIds"

const baseInput = {
  isLocked: false,
  brandSelected: true,
  modelSelected: true,
  isLoading: false,
  bodyOptionsCount: 0,
  yearOptionsCount: 5,
  modelKey: "a4-b9",
}

describe("resolveConfiguratorV2VehicleScrollTarget", () => {
  it("returns null when brand or model is missing", () => {
    expect(
      resolveConfiguratorV2VehicleScrollTarget({
        ...baseInput,
        brandSelected: false,
      }),
    ).toBeNull()
  })

  it("scrolls to year when brand and model are selected but year is missing", () => {
    expect(resolveConfiguratorV2VehicleScrollTarget(baseInput)).toBe(
      VEHICLE_YEAR_FIELD_ID,
    )
  })

  it("scrolls to body type when year is selected and body options exist", () => {
    expect(
      resolveConfiguratorV2VehicleScrollTarget({
        ...baseInput,
        year: "2020",
        bodyOptionsCount: 2,
      }),
    ).toBe(VEHICLE_BODY_TYPE_FIELD_ID)
  })

  it("prefers body type over year when both are pending", () => {
    expect(
      resolveConfiguratorV2VehicleScrollTarget({
        ...baseInput,
        year: "2020",
        bodyOptionsCount: 2,
        yearOptionsCount: 5,
      }),
    ).toBe(VEHICLE_BODY_TYPE_FIELD_ID)
  })

  it("uses locked field ids for locked product entry", () => {
    expect(
      resolveConfiguratorV2VehicleScrollTarget({
        ...baseInput,
        isLocked: true,
      }),
    ).toBe(LOCKED_VEHICLE_YEAR_FIELD_ID)

    expect(
      resolveConfiguratorV2VehicleScrollTarget({
        ...baseInput,
        isLocked: true,
        year: "2018",
        bodyOptionsCount: 3,
      }),
    ).toBe(LOCKED_VEHICLE_BODY_TYPE_FIELD_ID)
  })

  it("returns null while catalog is loading", () => {
    expect(
      resolveConfiguratorV2VehicleScrollTarget({
        ...baseInput,
        isLoading: true,
      }),
    ).toBeNull()
  })
})
