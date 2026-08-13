import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"
import {
  CatalogQuerySchema,
  getVehicleCatalog,
} from "@/features/vehicle-catalog"

export const revalidate = 300

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
}

export const GET = async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = CatalogQuerySchema.parse({
      brandKey: searchParams.get("brandKey") ?? undefined,
      modelParam: searchParams.get("modelParam") ?? undefined,
      modelFamilyKey: searchParams.get("modelFamilyKey") ?? undefined,
      modelFamilyPrefix: searchParams.get("modelFamilyPrefix") ?? undefined,
      year: searchParams.get("year") ?? undefined,
    })

    const payload = await getVehicleCatalog(query)
    const isBrandList = payload.level === "brands"

    return NextResponse.json(payload, {
      headers: isBrandList ? CACHE_HEADERS : undefined,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid vehicle catalog query", issues: error.issues },
        { status: 400 },
      )
    }

    console.error("Vehicle catalog request failed", error)
    return NextResponse.json(
      { error: "Vehicle catalog is temporarily unavailable" },
      { status: 500 },
    )
  }
}
