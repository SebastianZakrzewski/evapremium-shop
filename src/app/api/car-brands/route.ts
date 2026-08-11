import { NextResponse } from "next/server"
import { getSellableBrands } from "@/features/vehicle-catalog"

export const revalidate = 300
export const maxDuration = 30

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
}

export const GET = async () => {
  try {
    const brands = await getSellableBrands()
    return NextResponse.json(
      brands.map(({ id, name, logo, description, key }) => ({
        id,
        name,
        logo,
        description,
        key,
      })),
      { headers: CACHE_HEADERS },
    )
  } catch (error) {
    console.error("Car brands request failed", error)
    return NextResponse.json(
      { error: "Nie udało się pobrać marek samochodów" },
      { status: 500 },
    )
  }
}
