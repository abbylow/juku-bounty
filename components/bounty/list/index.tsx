"use client"

import { useEffect, useState } from "react"
import { Search } from "lucide-react"

import BountyCard from "@/components/bounty"
import { useCeramicContext } from "@/components/ceramic/ceramic-provider"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

// TODO: handle the error when bounty not found
export default function BountyList() {
  const { composeClient } = useCeramicContext()

  const [bountyList, setBountyList] = useState([])
  const [loading, setLoading] = useState<boolean>(true)

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

    const queryRes: any = list?.data?.bountiesIndex;
    setBountyList(queryRes?.edges.map((e: { node: any }) => e.node))
    setLoading(false)
  }

  useEffect(() => {
    getBountyList()
  }, [])

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Bounties</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            {/* category filter */}
            <Select>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Categories</SelectLabel>
                  <SelectItem value="art">Art</SelectItem>
                  <SelectItem value="data">Data</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="recommendation">Recommendation</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {/* status filter */}
            <Select>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {/* sort */}
            <Select>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Sort By</SelectLabel>
                  <SelectItem value="most-recent">Most recent</SelectItem>
                  <SelectItem value="highest-reward">Highest Reward</SelectItem>
                  <SelectItem value="due-soon">Due Soon</SelectItem>
                  <SelectItem value="most-replies">Most Replies</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {/* search bar */}
            <div className="flex-1 min-w-[200px]">
              <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <form>
                  <div className="relative">
                    <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search" className="pl-8" />
                  </div>
                </form>
              </div>
            </div>
          </div>

          {bountyList.map((b: any) => (
            <BountyCard key={b?.id} details={b} />
          ))}

          {loading && <div className="space-y-2">
            <Skeleton className="h-56" />
            <Skeleton className="h-56" />
          </div>}

        </CardContent>
      </Card>
    </>
  )
}