"use client"

import { Link } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useClipboard } from "@/hooks/useClipboard";
import getURL from "@/lib/get-url";

export default function BountyShareButton({ bountyId }: { bountyId: string }) {
  const { copy } = useClipboard({ timeout: 1000 });
  const shareBounty = () => {
    const bountyUrl = getURL(`/bounty/${bountyId}`);
    copy(bountyUrl, "Successfully copied bounty link.");
  }

  return (
    <Button variant="ghost" size="icon" onClick={shareBounty}>
      <Link className="h-5 w-5" />
    </Button>
  )
}