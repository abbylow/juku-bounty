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
    // TODO: get category from Bounty 
    // TODO: get tag from Bounty 
    const details = await composeClient.executeQuery(`
      query {
        node(id:"$${params.slug}"){
          ...on Bounty{
            id
            title
            description
            expiry
            createdAt
            author {
              profile {
                id
                username
                displayName
                pfp
              }
            }
          }
        }
      }
    `)
    console.log("bounty/[slug] getBounty", { details })

    const queryRes: any = details?.data?.node;
    setBountyDetails(queryRes);
    setLoading(false);
  }

  useEffect(() => {
    getBounty()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return <Skeleton className="h-56" />
  }

  return <BountyCard details={bountyDetails} />
}