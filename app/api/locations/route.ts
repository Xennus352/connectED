import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
    const supabase = await createClient()
  try {
    const { studentId, driverId, latitude, longitude, accuracy } = await request.json()

    // Validate required fields
    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    // Insert location into database
    const { data, error } = await supabase
      .from('gps_locations')
      .insert({
        student_id: studentId,
        driver_id: driverId,
        latitude,
        longitude,
        accuracy
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting location:', error)
      return NextResponse.json(
        { error: 'Failed to insert location' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in locations API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}