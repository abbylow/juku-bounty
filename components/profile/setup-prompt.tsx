"use client"

import { Terminal } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useViewerContext } from "@/contexts/viewer";

export default function ProfileSetupPrompt() {
  const { viewer } = useViewerContext();

  if (viewer === null) {
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
