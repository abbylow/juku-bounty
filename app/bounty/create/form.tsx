"use client"

import { format } from "date-fns"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from 'next/navigation'
import { CalendarIcon, ChevronDownIcon } from "@radix-ui/react-icons"
import { useEffect, useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import MultipleSelector from '@/components/ui/multiple-selector';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { TERMS_OF_SERVICE_URL } from "@/const/links"
import { useCeramicContext } from "@/components/ceramic/ceramic-provider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { CATEGORY_OPTIONS } from "@/const/categories"
import { TOPIC_OPTIONS } from "@/const/topics"
import { questTemplates } from "@/const/quest-templates"
import { Label } from "@/components/ui/label"
import { tomorrow, oneMonthFromNow, EXPIRY_PRESET, ACCEPTABLE_CURRENCIES } from "@/app/bounty/create/const";
import { bountyFormSchema, BountyFormValues, defaultValues } from "@/app/bounty/create/form-schema";

export function BountyForm() {
  const { composeClient, viewerProfile } = useCeramicContext();

  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // set loading to true when it's still getting viewer profile
    if (viewerProfile !== undefined) {
      setLoading(false)
    }
  }, [viewerProfile])

  const form = useForm<BountyFormValues>({
    resolver: zodResolver(bountyFormSchema),
    defaultValues,
    mode: "onBlur",
  })

  const createBounty = async (data: Partial<BountyFormValues>) => {
    if (!viewerProfile) {
      console.log('no viewerProfile => ', viewerProfile)
    } else {
      console.log("before submission ", { viewerProfile, data })

      setLoading(true);

      const creation = await composeClient.executeQuery(`
        mutation {
          createBounty(input: {
            content: {
              title: "${data?.title || ""}"
              description: "${data?.description?.replace(/\n/g, "\\n") || ""}"
              numberOfRewarders: ${data?.numberOfRewarders || ""}
              rewardCurrency: "${data?.rewardCurrency || ""}"
              amountPerRewarder: ${data?.amountPerRewarder || ""}
              expiry: "${data?.expiry?.toISOString() || ""}"
              createdAt: "${new Date().toISOString()}"
              profileId: "${viewerProfile.id}"
            }
          }) 
          {
            document {
              id
              title
              description
              numberOfRewarders
              rewardCurrency
              amountPerRewarder
              expiry
            }
          }
        }
      `);
      console.log({ creation })
      if (creation.errors) {
        toast({ title: `Something went wrong: ${creation.errors}` })
      } else {
        toast({ title: "Created bounty" })
        setLoading(true);

        const createdBounty: any = creation?.data?.createBounties
        if (createdBounty?.document?.id) {
          console.log(createdBounty.document.id)
          router.push(`/bounty/${createdBounty.document.id}`)
        }
      }
      setLoading(false);
    }
  };

  const onSubmit: SubmitHandler<BountyFormValues> = async (data) => {
    console.log("Submitting form with data:", { data });
    await createBounty(data)
  }

  const selectTemplate = (value: any) => {
    console.log(value)
    // TODO: set title and description using selected template
  }
  
  return (
    <>
      <div className="space-y-2">
        <Label>Quest Template</Label>
        <Select onValueChange={selectTemplate}>
          <SelectTrigger>
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent>
            {
              questTemplates.map(template => (
                <SelectItem value={template.type} key={template.type}>
                  {template.type}
                </SelectItem>
              ))
            }
          </SelectContent>
        </Select>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            disabled={loading}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Insert a catchy title to summarize your quest"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            disabled={loading}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Provide context for your quest, state your quest completion goal and reward criteria clearly."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-wrap gap-4">
            <FormField
              control={form.control}
              name="numberOfRewarders"
              disabled={loading}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Rewarders</FormLabel>
                  <FormControl onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(+(e?.target?.value))}>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      step={1}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rewardCurrency"
              disabled={loading}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select defaultValue={field.value} disabled={loading}>
                    <FormControl>
                      <SelectTrigger >
                        <SelectValue placeholder="Select a currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {
                        Object.values(ACCEPTABLE_CURRENCIES).map(c => (
                          <SelectItem value={c} key={c}>{c.toUpperCase()}</SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                  <ChevronDownIcon className="absolute right-3 top-2.5 h-4 w-4 opacity-50" />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amountPerRewarder"
              disabled={loading}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount per Rewarder</FormLabel>
                  <FormControl onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(+(e?.target?.value))}>
                    <Input
                      type="number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="expiry"
            disabled={loading}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Expiry Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={loading}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="flex w-auto flex-col space-y-2 p-2" align="start">
                    <Select
                      onValueChange={(value) => { field.onChange(EXPIRY_PRESET[value]) }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {Object.keys(EXPIRY_PRESET).map(p => (
                          <SelectItem value={p} key={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="rounded-md border">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < tomorrow || date > oneMonthFromNow
                        }
                        initialFocus
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            disabled={loading}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expert Category</FormLabel>
                <Select defaultValue={field.value} disabled={loading}>
                  <FormControl>
                    <SelectTrigger >
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {
                      CATEGORY_OPTIONS.map(c => (
                        <SelectItem value={c.value} key={c.value}>{c.label}</SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
                <ChevronDownIcon className="absolute right-3 top-2.5 h-4 w-4 opacity-50" />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            disabled={loading}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Topics</FormLabel>
                <FormControl>
                  <MultipleSelector
                    {...field}
                    creatable
                    maxSelected={5}
                    onMaxSelected={(maxLimit) => {
                      toast({
                        title: `You have reached max selected: ${maxLimit}`,
                      });
                    }}
                    defaultOptions={TOPIC_OPTIONS}
                    placeholder="Add topics for discovery..."
                    emptyIndicator={
                      <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                        no results found.
                      </p>
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={loading}>Open Bounty</Button>

          <p className="text-sm text-muted-foreground">
            By confirming to open the bounty, you hereby acknowledge that you have read and accept our {" "}
            <a href={TERMS_OF_SERVICE_URL} rel="noreferrer noopener" target="_blank" className="transition-colors text-foreground/60 underline hover:text-foreground/80">
              Terms of Service
            </a>.
          </p>
        </form >
      </Form >
    </>
  )
}
