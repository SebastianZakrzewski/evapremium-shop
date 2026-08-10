import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import {
  MatRealizationMatTypeSchema,
  MatRealizationPhotosQuerySchema,
} from "@/features/mat-realization-photos"
import { getMatRealizationPhotos } from "@/features/mat-realization-photos/server/repository"

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
  matType: stringParam,
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rawParams = QueryParamsSchema.parse({
      recordKey: searchParams.get("recordKey"),
      matTemplateId: searchParams.get("matTemplateId"),
      brandKey: searchParams.get("brandKey"),
      modelKey: searchParams.get("modelKey"),
      matType: searchParams.get("matType"),
    })

    const matType = rawParams.matType
      ? MatRealizationMatTypeSchema.parse(rawParams.matType)
      : undefined

    const query = MatRealizationPhotosQuerySchema.parse({
      ...rawParams,
      matType,
    })
    const photos = await getMatRealizationPhotos(query)

    return NextResponse.json({
      photos,
      count: photos.length,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Nieprawidłowe parametry zapytania", details: error.errors },
        { status: 400 },
      )
    }

    console.error("API /api/mat-realization-photos:", error)
    return NextResponse.json(
      { error: "Wewnętrzny błąd serwera" },
      { status: 500 },
    )
  }
}
