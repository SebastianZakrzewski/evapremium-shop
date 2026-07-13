import { NextResponse } from "next/server"
import { getLegacyBodyTypes } from "@/features/vehicle-catalog/server/legacyCatalogService"

export const dynamic = "force-dynamic"
export const maxDuration = 30

export const GET = async () => {
  try {
    const bodyTypes = await getLegacyBodyTypes()
    return NextResponse.json(bodyTypes)
  } catch (error) {
    console.error("Body types catalog request failed", error)
    return NextResponse.json(
      { error: "Wystąpił błąd serwera" },
      { status: 500 },
    )
  }
}
