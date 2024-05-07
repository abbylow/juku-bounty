// Testing with kjzl6kcym7w8y8fgvmgdikf2a8kl2vt5jyqyrzhxqsegv7hmi30y7jh3sbsy5qp
"use client"

import { useEffect, useState } from "react"
import { useCeramicContext } from "@/components/ceramic/ceramic-provider"
import BountyCard from "@/components/bounty"
import { Skeleton } from "@/components/ui/skeleton"

// TODO: handle the error when bounty not found
export default function BountyDetails({ params }: { params: { slug: string } }) {
  const { composeClient } = useCeramicContext()

  const [bountyDetails, setBountyDetails] = useState({})
  const [loading, setLoading] = useState<boolean>(true)

  const getBounty = async () => {
    const details = await composeClient.executeQuery(`
      query {
        node(id:"$${params.slug}"){
          ...on Bounties{
            id
            title
            description
            numberOfRewarders
            rewardCurrency
            amountPerRewarder
            expiry
            created
            author {
              basicProfile {
                id
                username
                displayName
              }
            }
          }
        }
      }
    `)
    console.log({ details })

    const queryRes: any = details?.data?.node;
    setBountyDetails(queryRes);
    setLoading(false);
  }

  useEffect(() => {
    getBounty()
  }, [])

  if (loading) {
    return <Skeleton className="h-56" />
  }

  return <BountyCard details={bountyDetails} />
}