import { NextResponse } from "next/server"
import { getSellableBrands } from "@/features/vehicle-catalog"

export const dynamic = "force-dynamic"
export const maxDuration = 30

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
    )
  } catch (error) {
    console.error("Car brands request failed", error)
    return NextResponse.json(
      { error: "Nie udało się pobrać marek samochodów" },
      { status: 500 },
    )
  }
}
