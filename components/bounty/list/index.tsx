"use client"

import { useQuery } from "@tanstack/react-query"
import { Search } from "lucide-react"
import { useState } from "react"

import BountyCard from "@/components/bounty"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
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
import { useCategoryContext } from "@/contexts/categories"
import { getBounties } from "@/actions/bounty/getBounties"
import { getBountyCount } from "@/actions/bounty/getBountyCount"

const itemsPerPage = 1;

export default function BountyList() {
  const { isCategoriesPending, categoryOptions } = useCategoryContext();

  // Handle pagination
  // Get the total numbers of rows (with filter)
  const { data: bountyCount, isPending: isBountyCountPending } = useQuery({
    queryKey: ['fetchBountyCount'], // TODO: change this query key with filter states
    queryFn: async () => await getBountyCount({
      // categoryId?: string;
      // title?: string;
      // description?: string;
    })
  })

  console.log({ bountyCount, isBountyCountPending })

  const [currentPage, setCurrentPage] = useState<number>(1);
  const prevPage = () => {
    setCurrentPage(prevState => prevState - 1)
  }
  const nextPage = () => {
    setCurrentPage(prevState => prevState + 1)
  }

  const { data: bounties, isPending: isBountiesPending, isError: isBountiesError } = useQuery({
    queryKey: ['fetchBounties', currentPage, itemsPerPage],
    queryFn: async () => await getBounties({
      limit: itemsPerPage,
      offset: (currentPage - 1) * itemsPerPage
      // categoryId?: string; // Optional filter by category ID
      // title?: string; // Optional fuzzy search on title
      // description?: string; // Optional fuzzy search on description
      // orderBy?: string;
      // orderDirection?: string;
    })
  })

  console.log({ bounties, isBountiesPending })

  if (isBountiesError) {
    return <div>Error: Bounties not found!</div>
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Bounties</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            {!isCategoriesPending && <Select
            // onValueChange={field.onChange} 
            // defaultValue={field.value} 
            // disabled={loading}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Categories" />
              </SelectTrigger>
              <SelectContent>
                {
                  categoryOptions.map(c => (
                    <SelectItem value={c.value} key={c.value}>{c.label}</SelectItem>
                  ))
                }
              </SelectContent>
            </Select>}
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
                  {/* <SelectItem value="highest-reward">Highest Reward</SelectItem> */}
                  <SelectItem value="due-soon">Due Soon</SelectItem>
                  {/* <SelectItem value="most-replies">Most Replies</SelectItem> */}
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

          {bounties?.map((b: any) => (
            <BountyCard key={b?.id} details={b} />
          ))}

          {isBountiesPending && <div className="space-y-2">
            <Skeleton className="h-56" />
            <Skeleton className="h-56" />
          </div>}

          {!isBountiesPending && !isBountyCountPending && (
            <Pagination>
              <PaginationContent>
                {currentPage > 1 && (<PaginationItem>
                  <PaginationPrevious onClick={prevPage} />
                </PaginationItem>)}
                {((bountyCount || 0) / itemsPerPage) > currentPage && (<PaginationItem>
                  <PaginationNext onClick={nextPage} />
                </PaginationItem>)}
              </PaginationContent>
            </Pagination>
          )}

        </CardContent>
      </Card>
    </>
  )
}