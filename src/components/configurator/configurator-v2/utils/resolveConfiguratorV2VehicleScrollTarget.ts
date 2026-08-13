import {
  LOCKED_VEHICLE_BODY_TYPE_FIELD_ID,
  LOCKED_VEHICLE_YEAR_FIELD_ID,
  VEHICLE_BODY_TYPE_FIELD_ID,
  VEHICLE_YEAR_FIELD_ID,
} from "./configuratorV2VehicleFieldIds"

export type ConfiguratorV2VehicleScrollTargetInput = {
  isLocked: boolean
  brandSelected: boolean
  modelSelected: boolean
  year?: string
  bodyTypeKey?: string
  modelKey?: string
  isLoading: boolean
  bodyOptionsCount: number
  yearOptionsCount: number
}

export const resolveConfiguratorV2VehicleScrollTarget = (
  input: ConfiguratorV2VehicleScrollTargetInput,
): string | null => {
  if (!input.brandSelected || !input.modelSelected || input.isLoading) {
    return null
  }

  const bodyTypeFieldId = input.isLocked
    ? LOCKED_VEHICLE_BODY_TYPE_FIELD_ID
    : VEHICLE_BODY_TYPE_FIELD_ID
  const yearFieldId = input.isLocked
    ? LOCKED_VEHICLE_YEAR_FIELD_ID
    : VEHICLE_YEAR_FIELD_ID

  const needsBodyType =
    Boolean(input.year) &&
    input.bodyOptionsCount > 0 &&
    !input.bodyTypeKey

  if (needsBodyType) return bodyTypeFieldId

  const needsYear =
    !input.year && Boolean(input.modelKey) && input.yearOptionsCount > 0

  if (needsYear) return yearFieldId

  return null
}
