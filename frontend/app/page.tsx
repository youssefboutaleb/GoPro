'use client'

import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import AdminDashboard from "@/components/AdminDashboard"
import SupervisorDashboard from "@/components/SupervisorDashboard"
import SalesDirectorDashboard from "@/components/SalesDirectorDashboard"
import DelegateDashboard from "@/components/DelegateDashboard"

export default function HomePage() {
  const { user, profile, loading, signOut, signOutLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  // Show loading state only for initial auth check
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to auth if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  // Progressive loading - show UI immediately when user exists
  const renderDashboard = () => {
    // Show basic functionality even without full profile
    if (!profile) {
      return (
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {user.email}
              </h1>
              <p className="text-gray-600">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      )
    }

    // Render role-specific dashboard
    switch (profile.role) {
      case 'Admin':
        return <AdminDashboard onSignOut={signOut} signOutLoading={signOutLoading} profile={profile} />
      case 'Supervisor':
        return <SupervisorDashboard onSignOut={signOut} signOutLoading={signOutLoading} profile={profile} />
      case 'Sales Director':
        return <SalesDirectorDashboard onSignOut={signOut} signOutLoading={signOutLoading} profile={profile} />
      case 'Delegate':
        return <DelegateDashboard />
      default:
        return (
          <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Welcome, {profile.first_name && profile.last_name ? `${profile.first_name} ${profile.last_name}` : user.email}
                </h1>
                <p className="text-gray-600 mb-4">
                  Your role ({profile.role}) does not have a dashboard configured.
                </p>
                <button
                  onClick={signOut}
                  disabled={signOutLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {signOutLoading ? 'Signing out...' : 'Sign Out'}
                </button>
              </div>
            </div>
          </div>
        )
    }
  }

  return renderDashboard()
}

