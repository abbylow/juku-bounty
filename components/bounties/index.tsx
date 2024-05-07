"use client"

import { useEffect, useState } from "react"
import { useCeramicContext } from "@/components/ceramic/ceramic-provider"

// TODO: handle the error when bounty not found
export default function BountyList() {
  const { composeClient } = useCeramicContext()

  const [bountyList, setBountyList] = useState([])

  const getBountyList = async () => {
    const list = await composeClient.executeQuery(`
      query {
        bountiesIndex (last: 20) {
          edges {
            node {
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
      }
    `)
    console.log({ list })
    setBountyList(list)
  }

  useEffect(() => {
    getBountyList()
  }, [])

  return <div>My bounty list</div>
}