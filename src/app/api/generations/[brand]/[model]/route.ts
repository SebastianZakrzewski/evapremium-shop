import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getLegacyGenerations } from "@/features/vehicle-catalog/server/legacyCatalogService"

export const dynamic = "force-dynamic"
export const maxDuration = 30

const ModelParamsSchema = z.object({
  brand: z.string().min(1, "Nazwa marki jest wymagana"),
  model: z.string().min(1, "Nazwa modelu jest wymagana"),
})

export const GET = async (
  _request: NextRequest,
  { params }: { params: Promise<{ brand: string; model: string }> },
) => {
  try {
    const resolvedParams = await params
    const validatedParams = ModelParamsSchema.parse({
      brand: decodeURIComponent(resolvedParams.brand),
      model: decodeURIComponent(resolvedParams.model),
    })

    const generations = await getLegacyGenerations({
      brand: validatedParams.brand,
      model: validatedParams.model,
    })

    return NextResponse.json(generations)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid generations path params", issues: error.issues },
        { status: 400 },
      )
    }

    console.error("Brand/model generations request failed", error)
    return NextResponse.json(
      { error: "Wystąpił błąd serwera" },
      { status: 500 },
    )
  }
}
