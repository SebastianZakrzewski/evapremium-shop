import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { MatModelPreviewsQuerySchema } from "@/features/mat-model-previews"
import { getMatModelPreviews } from "@/features/mat-model-previews/server/repository"

export const maxDuration = 30

const stringParam = z.preprocess(
  (val) => (val === null || val === "" ? undefined : val),
  z.string().optional(),
)

const QueryParamsSchema = z.object({
  recordKey: stringParam,
  matTemplateId: stringParam,
  brandKey: stringParam,
  modelKey: stringParam,
  bodyTypeKey: stringParam,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rawParams = QueryParamsSchema.parse({
      recordKey: searchParams.get("recordKey"),
      matTemplateId: searchParams.get("matTemplateId"),
      brandKey: searchParams.get("brandKey"),
      modelKey: searchParams.get("modelKey"),
      bodyTypeKey: searchParams.get("bodyTypeKey"),
    })

    const query = MatModelPreviewsQuerySchema.parse(rawParams)
    const previews = await getMatModelPreviews(query)

    return NextResponse.json({
      previews,
      count: previews.length,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Nieprawidłowe parametry zapytania", details: error.errors },
        { status: 400 },
      )
    }

    console.error("API /api/mat-model-previews:", error)
    return NextResponse.json(
      { error: "Wewnętrzny błąd serwera" },
      { status: 500 },
    )
  }
}
