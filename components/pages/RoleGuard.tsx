// components/UI/RoleGuard.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {createClient  } from '@/utils/supabase/client'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: string[]
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const [isAllowed, setIsAllowed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
const supabase = createClient()
  useEffect(() => {
    checkUserRole()
  }, [])

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Get user profile with role
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        router.push('/auth/login')
        return
      }

      if (profile && allowedRoles.includes(profile.role)) {
        setIsAllowed(true)
      } else {
        router.push('/unauthorized')
      }
    } catch (error) {
      console.error('Error checking user role:', error)
      router.push('/auth/login')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return isAllowed ? <>{children}</> : null
}