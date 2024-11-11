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

type SortOptions = "most-recent" | "due-soon";

const itemsPerPage = 10; // TODO: change this 

export default function BountyList() {
  const { isCategoriesPending, categoryOptions } = useCategoryContext();

  // State for pagination, sorting, and filtering by category
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortBy, setSortBy] = useState<SortOptions>("most-recent"); // Default sort
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // Default: no category selected

  // Handle pagination
  const prevPage = () => setCurrentPage((prevState) => Math.max(prevState - 1, 1));
  const nextPage = () => setCurrentPage((prevState) => prevState + 1);

  // Get the total numbers of rows (with filters)
  const { data: bountyCount, isPending: isBountyCountPending } = useQuery({
    queryKey: ['fetchBountyCount', selectedCategory], // TODO: change this query key with filter states
    queryFn: async () => await getBountyCount({
      categoryId: selectedCategory,
      // title?: string;
      // description?: string;
    })
  });

  // Map `sortBy` value to `orderBy` and `orderDirection`
  const sortMapping: Record<SortOptions, { orderBy: string; orderDirection: string }>  = {
    "most-recent": { orderBy: "created_at", orderDirection: "DESC" },
    "due-soon": { orderBy: "expiry", orderDirection: "ASC" }
  };

  const { orderBy, orderDirection } = sortMapping[sortBy];
  console.log({ orderBy, orderDirection })

  // Fetch bounties with pagination, filters, and sorting
  const { data: bounties, isPending: isBountiesPending, isError: isBountiesError } = useQuery({
    queryKey: ['fetchBounties', currentPage, itemsPerPage, orderBy, orderDirection, selectedCategory],
    queryFn: async () => await getBounties({
      limit: itemsPerPage,
      offset: (currentPage - 1) * itemsPerPage,
      orderBy,
      orderDirection,
      categoryId: selectedCategory, // Filter by selected category
      // title?: string; // Optional fuzzy search on title
      // description?: string; // Optional fuzzy search on description
    })
  });

  console.log({ bountyCount, isBountyCountPending });
  console.log({ bounties, isBountiesPending });

  if (isBountiesError) {
    return <div>Error: Bounties not found!</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Bounties</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            {!isCategoriesPending && (
              <Select onValueChange={(value) => setSelectedCategory(value === "*" ? null : value)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={"*"}>All Categories</SelectItem>
                  {categoryOptions.map((c) => (
                    <SelectItem value={c.value} key={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {/* Sort by */}
            <Select onValueChange={(value: SortOptions) => setSortBy(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Sort By</SelectLabel>
                  <SelectItem value="most-recent">Most recent</SelectItem>
                  <SelectItem value="due-soon">Due Soon</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Search bar */}
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
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationPrevious onClick={prevPage} />
                  </PaginationItem>
                )}
                {((bountyCount || 0) / itemsPerPage) > currentPage && (
                  <PaginationItem>
                    <PaginationNext onClick={nextPage} />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>
    </>
  );
}
