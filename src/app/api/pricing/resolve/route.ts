import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"
import {
  PricingResolveSchema,
  resolveVehiclePricing,
} from "@/features/vehicle-catalog"

export const dynamic = "force-dynamic"

export const POST = async (request: NextRequest) => {
  try {
    const input = PricingResolveSchema.parse(await request.json())
    return NextResponse.json(await resolveVehiclePricing(input))
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid pricing request", issues: error.issues },
        { status: 400 },
      )
    }

    const message = error instanceof Error ? error.message : "Pricing failed"
    const status = message.includes("not found") ? 404 : 422
    return NextResponse.json({ error: message }, { status })
  }
}
