'use client'

import RythmeRecrutement from "@/components/RythmeRecrutement"
import { useRouter } from "next/navigation"

export default function RecruitmentRatePage() {
  const router = useRouter()
  
  const handleBack = () => {
    router.back()
  }

  return <RythmeRecrutement onBack={handleBack} />
}

