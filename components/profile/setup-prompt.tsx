"use client"

import { Terminal } from "lucide-react"

import { useCeramicContext } from "@/components/ceramic/ceramic-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ProfileSetupPrompt() {
  const { viewerProfile } = useCeramicContext();

  if (viewerProfile === null) {
    return (
      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle>Welcome onboarding!</AlertTitle>
        <AlertDescription>
          {`Let's setup your basic profile before exploring the app!`}
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
