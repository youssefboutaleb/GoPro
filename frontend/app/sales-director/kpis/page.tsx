'use client'

import SalesDirectorKPIsDashboard from "@/components/SalesDirectorKPIsDashboard"
import { useRouter } from "next/navigation"

export default function SalesDirectorKPIsPage() {
  const router = useRouter()
  
  const handleBack = () => {
    router.back()
  }

  return <SalesDirectorKPIsDashboard onBack={handleBack} />
}

