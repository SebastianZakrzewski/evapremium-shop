import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getBrandModelsCatalog } from "@/features/vehicle-catalog"

export const dynamic = "force-dynamic"
export const maxDuration = 30

const QueryParamsSchema = z.object({
  brand: z.string().trim().min(1).optional(),
})

export const GET = async (request: NextRequest) => {
  try {
    const brand = request.nextUrl.searchParams.get("brand") ?? undefined
    const validated = QueryParamsSchema.parse({ brand })

    if (!validated.brand) {
      return NextResponse.json([])
    }

    const models = await getBrandModelsCatalog(validated.brand)
    return NextResponse.json(models)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid models query", issues: error.issues },
        { status: 400 },
      )
    }

    console.error("Models catalog request failed", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Wystąpił błąd serwera" },
      { status: 500 },
    )
  }
}
