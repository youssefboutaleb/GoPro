'use client'

import ActionPlansList from "@/components/action-plans/ActionPlansList"
import { useRouter } from "next/navigation"

export default function ActionPlansPage() {
  const router = useRouter()
  
  const handleBack = () => {
    router.back()
  }

  return <ActionPlansList onBack={handleBack} />
}

