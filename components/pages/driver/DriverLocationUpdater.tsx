
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

interface DriverLocationUpdaterProps {
  driverId: string
  updateInterval?: number
}

export default function DriverLocationUpdater({ 
  driverId, 
  updateInterval = 10000 
}: DriverLocationUpdaterProps) {
  const [isTracking, setIsTracking] = useState(false)
  const supabase = createClient()
  useEffect(() => {
    let intervalId: NodeJS.Timeout
    
    if (isTracking) {
      // Update location immediately and then at intervals
      updateLocation()
      
      intervalId = setInterval(() => {
        updateLocation()
      }, updateInterval)
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [isTracking, driverId, updateInterval])
  
  const updateLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords
          
          // Insert location into database
          const { error } = await supabase
            .from('gps_locations')
            .insert({
              driver_id: driverId,
              latitude,
              longitude,
              accuracy
            })
            
          if (error) {
            console.error('Error updating location:', error)
          }
        },
        (error) => {
          console.error('Error getting location:', error)
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      )
    }
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-1000 bg-white p-4 rounded shadow">
      <button
        onClick={() => setIsTracking(!isTracking)}
        className={`px-4 py-2 rounded ${
          isTracking 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-green-500 hover:bg-green-600'
        } text-white`}
      >
        {isTracking ? 'Stop Tracking' : 'Start Tracking'}
      </button>
      <p className="text-sm mt-2">
        Status: {isTracking ? 'Tracking enabled' : 'Tracking disabled'}
      </p>
    </div>
  )
}