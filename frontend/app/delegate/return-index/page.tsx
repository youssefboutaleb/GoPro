'use client'

import ReturnIndexAnalysis from "@/components/ReturnIndexAnalysis"
import { useRouter } from "next/navigation"

export default function ReturnIndexPage() {
  const router = useRouter()
  
  const handleBack = () => {
    router.back()
  }

  return <ReturnIndexAnalysis onBack={handleBack} />
}

