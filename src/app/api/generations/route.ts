import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getLegacyGenerations } from "@/features/vehicle-catalog/server/legacyCatalogService"

export const dynamic = "force-dynamic"
export const maxDuration = 30

const QueryParamsSchema = z.object({
  brand: z.string().optional(),
  model: z.string().optional(),
  bodyType: z.string().optional(),
  yearFrom: z
    .string()
    .transform((value) => (value ? parseInt(value, 10) : undefined))
    .optional(),
  yearTo: z
    .string()
    .transform((value) => (value ? parseInt(value, 10) : undefined))
    .optional(),
  isCurrentlyProduced: z
    .string()
    .transform((value) => value === "true")
    .optional(),
})

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const validatedParams = QueryParamsSchema.parse({
      brand: searchParams.get("brand") ?? undefined,
      model: searchParams.get("model") ?? undefined,
      bodyType: searchParams.get("bodyType") ?? undefined,
      yearFrom: searchParams.get("yearFrom") ?? undefined,
      yearTo: searchParams.get("yearTo") ?? undefined,
      isCurrentlyProduced: searchParams.get("isCurrentlyProduced") ?? undefined,
    })

    const generations = await getLegacyGenerations(validatedParams)
    return NextResponse.json(generations)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid generations query", issues: error.issues },
        { status: 400 },
      )
    }

    console.error("Generations catalog request failed", error)
    return NextResponse.json(
      { error: "Wystąpił błąd serwera" },
      { status: 500 },
    )
  }
}
