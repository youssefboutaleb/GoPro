'use client'

import VisitReport from "@/components/VisitReport"
import { useRouter } from "next/navigation"

export default function VisitReportPage() {
  const router = useRouter()
  
  const handleBack = () => {
    router.back()
  }

  return <VisitReport onBack={handleBack} />
}

