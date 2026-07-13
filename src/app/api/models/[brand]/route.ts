import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getBrandModelsCatalog } from "@/features/vehicle-catalog"

export const dynamic = "force-dynamic"
export const maxDuration = 30

const BrandParamsSchema = z.object({
  brand: z.string().min(1, "Nazwa marki jest wymagana"),
})

export const GET = async (
  _request: NextRequest,
  { params }: { params: Promise<{ brand: string }> },
) => {
  try {
    const resolvedParams = await params
    const validatedParams = BrandParamsSchema.parse({
      brand: decodeURIComponent(resolvedParams.brand),
    })

    const models = await getBrandModelsCatalog(validatedParams.brand)
    return NextResponse.json(models)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid brand path param", issues: error.issues },
        { status: 400 },
      )
    }

    console.error("Brand models catalog request failed", error)
    return NextResponse.json(
      { error: "Wystąpił błąd serwera" },
      { status: 500 },
    )
  }
}
