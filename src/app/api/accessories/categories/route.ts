import { NextResponse } from 'next/server'
import { AccessoryService } from '@/lib/services/AccessoryService'

const accessoryService = new AccessoryService()

export async function GET() {
  try {
    const categories = await accessoryService.getAllCategories()

    return NextResponse.json({
      success: true,
      data: categories,
      count: categories.length,
    })
  } catch (error) {
    console.error('Error fetching accessory categories:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
