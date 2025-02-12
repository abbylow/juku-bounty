"use client"

import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation";

import BountyPage from "@/components/bounty"
import { Skeleton } from "@/components/ui/skeleton"
import { getBounty } from "@/actions/bounty/getBounty"

export default function BountyDetails({ params }: { params: { slug: string } }) {
  const searchParams = useSearchParams();
  const isClosingMode = searchParams.get("isClosingMode");

  const { data: bounty, isPending: isBountyPending } = useQuery({
    queryKey: ['fetchBounty', params.slug],
    queryFn: async () => await getBounty({ bountyId: params.slug })
  })
  if (isBountyPending) {
    return <Skeleton className="h-56" />
  }

  return <BountyPage details={bounty} isClosingMode={isClosingMode === "true"} />
}
