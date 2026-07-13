import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { searchVehicleCatalog } from "@/features/vehicle-catalog"
import { normalizeVehicleSearchQuery } from "@/shared/vehicle/searchQuery"

export const dynamic = "force-dynamic"
export const maxDuration = 30

const QueryParamsSchema = z.object({
  q: z.string().min(1).max(100),
})

export const GET = async (request: NextRequest) => {
  try {
    const query = request.nextUrl.searchParams.get("q")
    if (!query) {
      return NextResponse.json({ brands: [], models: [], products: [] })
    }

    const validated = QueryParamsSchema.parse({ q: query })
    const results = await searchVehicleCatalog(normalizeVehicleSearchQuery(validated.q))

    return NextResponse.json({
      brands: results.brands.map(({ id, name, logo, description }) => ({
        id,
        name,
        logo,
        description,
      })),
      models: results.models,
      products: results.products,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ brands: [], models: [], products: [] })
    }

    console.error("Search request failed", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Wystąpił błąd serwera" },
      { status: 500 },
    )
  }
}
