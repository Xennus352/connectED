
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/utils/supabase/client'
import RoleGuard from '../RoleGuard'
import RealTimeMap from './RealtimeMap'
import DriverLocationUpdater from './DriverLocationUpdater'

export default function DriverMapPage() {
  const [driverId, setDriverId] = useState('')
  const router = useRouter()
const supabase = createClient()
  useEffect(() => {
    getDriverId()
  }, [])

  const getDriverId = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: driver } = await supabase
      .from('drivers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (driver) {
      setDriverId(driver.id)
    }
  }

  return (
    <RoleGuard allowedRoles={['driver']}>
      <div className="h-screen flex flex-col">
        <header className="bg-green-600 text-white p-4">
          <h1 className="text-xl font-bold">Driver Live Tracking</h1>
          <p>Viewing your assigned students</p>
        </header>
        <RealTimeMap role="driver" userId={driverId} />
        {driverId && <DriverLocationUpdater driverId={driverId} />}
      </div>
    </RoleGuard>
  )
}