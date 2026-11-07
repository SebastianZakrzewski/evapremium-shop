import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getBrandModelsCatalog } from "@/features/vehicle-catalog"

export const dynamic = "force-dynamic"
export const maxDuration = 30

const QueryParamsSchema = z.object({
  brand: z.string().trim().min(1).optional(),
  model: z.string().trim().min(1).optional(),
  generation: z.string().trim().min(1).optional(),
  bodyType: z.string().trim().min(1).optional(),
})

export const GET = async (request: NextRequest) => {
  try {
    const params = request.nextUrl.searchParams
    const validated = QueryParamsSchema.parse({
      brand: params.get("brand") ?? undefined,
      model: params.get("model") ?? undefined,
      generation: params.get("generation") ?? undefined,
      bodyType: params.get("bodyType") ?? undefined,
    })

    if (!validated.brand) {
      return NextResponse.json([])
    }

    const pinned =
      validated.model || validated.generation || validated.bodyType
        ? {
            modelFamilyKey: validated.model,
            generation: validated.generation,
            bodyTypeKey: validated.bodyType,
          }
        : undefined

    const models = await getBrandModelsCatalog(validated.brand, pinned)
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
