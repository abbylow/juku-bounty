"use client"

import { format } from "date-fns"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from 'next/navigation'
import { CalendarIcon, ChevronDownIcon } from "@radix-ui/react-icons"
import { useEffect, useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } from "@/const/links"
import { useCeramicContext } from "@/components/ceramic/ceramic-provider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

// TODO: prompt user to create profile first 
// TODO: add categories
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const oneWeekFromNow = new Date();
oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

const twoWeeksFromNow = new Date();
twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);

const oneMonthFromNow = new Date();
oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

const EXPIRY_PRESET: Record<string, Date> = {
  "In 7 days": oneWeekFromNow,
  "In 14 days": twoWeeksFromNow,
  "In 1 month": oneMonthFromNow,
}

const ACCEPTABLE_CURRENCIES = {
  USDC: "usdc",
  USDT: "usdt"
} as const;
type ACCEPTABLE_CURRENCIES = typeof ACCEPTABLE_CURRENCIES[keyof typeof ACCEPTABLE_CURRENCIES];

const MAX_NUM_OF_TAGS = 5;

const bountyFormSchema = z.object({
  title: z
    .string()
    .min(5, {
      message: "Name must be at least 5 characters.",
    })
    .max(80, {
      message: "Name must not be longer than 80 characters.",
    }),
  description: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(1000, {
      message: "Name must not be longer than 1000 characters.",
    }),
  rewardCurrency: z.enum(Object.values(ACCEPTABLE_CURRENCIES) as [ACCEPTABLE_CURRENCIES, ACCEPTABLE_CURRENCIES], {
    invalid_type_error: "Select a currency",
    required_error: "Please select a currency.",
  }),
  amountPerRewarder: z.number()
    .positive({ message: "Number must be greater than zero" }),
  numberOfRewarders: z.number()
    .int({ message: "Value must be an integer" })
    .min(1, { message: "Value must be at least 1" })
    .max(10, { message: "Value must be no more than 10" }),
  expiry: z.date()
    .refine(date => date >= tomorrow, { // Checks if the date is at least one day in the future
      message: "Expiry date must be at least one day in the future",
    })
    .refine(date => date <= oneMonthFromNow, { // Checks if the date is within one month
      message: "Expiry date must be within one month from now",
    }),
  // categories: z.array(z.string())
  //   .max(MAX_NUM_OF_TAGS, { message: "Categories can contain no more than 5 tags" })
  //   .optional()
  //   .refine(array => new Set(array).size === array?.length, {
  //     message: "All tags in the categories must be unique",
  //   })
})

type BountyFormValues = z.infer<typeof bountyFormSchema>

const defaultValues: Partial<BountyFormValues> = {
  title: "",
  description: "",
  rewardCurrency: ACCEPTABLE_CURRENCIES.USDC,
  amountPerRewarder: 10,
  numberOfRewarders: 1,
  expiry: oneMonthFromNow,
}

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

      // TODO: change this mutation to setBasicProfile as createBasicProfile is deprecated soon
      // TODO: update the viewer profile type in context to include `id`
      const creation = await composeClient.executeQuery(`
        mutation {
          createBounties(input: {
            content: {
              title: "${data?.title || ""}"
              description: "${data?.description?.replace(/\n/g, "\\n") || ""}"
              numberOfRewarders: ${data?.numberOfRewarders || ""}
              rewardCurrency: "${data?.rewardCurrency || ""}"
              amountPerRewarder: ${data?.amountPerRewarder || ""}
              expiry: "${data?.expiry?.toISOString() || ""}"
              created: "${new Date().toISOString()}"
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

  return (
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

        {/* TODO: TBD - category should be dropdown if only admin can set */}

        <Button type="submit" disabled={loading}>Open Bounty</Button>

        <p className="text-sm text-muted-foreground">
          By confirming to open the bounty, you hereby acknowledge that you have read and accept our {" "}
          <a href={TERMS_OF_SERVICE_URL} rel="noreferrer noopener" target="_blank" className="transition-colors text-foreground/60 underline hover:text-foreground/80">
            Terms of Service
          </a> and <a href={PRIVACY_POLICY_URL} rel="noreferrer noopener" target="_blank" className="transition-colors text-foreground/60 underline hover:text-foreground/80">
            Privacy Policy
          </a>.
        </p>
      </form >
    </Form >
  )
}
