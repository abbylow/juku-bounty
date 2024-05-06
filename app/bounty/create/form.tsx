"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, ChevronDownIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
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

// TODO: read this https://ui.shadcn.com/docs/components/form 
// TODO: change select to this? https://ui.shadcn.com/docs/components/select#form
// TODO: check validation rule
// TODO: cautious to store the local time of the expiry date
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const oneMonthFromNow = new Date();
oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

const ACCEPTABLE_CURRENCIES = ["usdc", "usdt"] as const;
const MAX_NUM_OF_TAGS = 5;

const bountyFormSchema = z.object({
  title: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(80, {
      message: "Name must not be longer than 80 characters.",
    }),
  content: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(5000, {
      message: "Name must not be longer than 5000 characters.",
    }),
  currency: z.enum(ACCEPTABLE_CURRENCIES, {
    invalid_type_error: "Select a currency",
    required_error: "Please select a currency.",
  }),
  amountPerRewarder: z.number()
    .positive({ message: "Number must be greater than zero" }),
  numberOfRewarders: z.number()
    .min(1, { message: "Value must be at least 1" })
    .max(10, { message: "Value must be no more than 10" }),
  expiry: z.date()
    .refine(date => date >= tomorrow, { // Checks if the date is at least one day in the future
      message: "Expiry date must be at least one day in the future",
    })
    .refine(date => date <= oneMonthFromNow, { // Checks if the date is within one month
      message: "Expiry date must be within one month from now",
    }),
  categories: z.array(z.string())
    .max(MAX_NUM_OF_TAGS, { message: "Categories can contain no more than 5 tags" })
    .optional()
    .refine(array => new Set(array).size === array?.length, {
      message: "All tags in the categories must be unique",
    })
})

type BountyFormValues = z.infer<typeof bountyFormSchema>

export function BountyForm() {
  const form = useForm<BountyFormValues>({
    resolver: zodResolver(bountyFormSchema),
    mode: "onChange",
  })

  function onSubmit(data: BountyFormValues) {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
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
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
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
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Rewarders</FormLabel>
                <FormControl>
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
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <div className="relative w-max">
                  <FormControl>
                    <select
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "w-[200px] appearance-none font-normal"
                      )}
                      {...field}
                    >
                      {
                        ACCEPTABLE_CURRENCIES.map(c => (
                          <option value={c} key={c}>{c.toUpperCase()}</option>
                        ))
                      }
                    </select>
                  </FormControl>
                  <ChevronDownIcon className="absolute right-3 top-2.5 h-4 w-4 opacity-50" />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amountPerRewarder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount per Rewarder</FormLabel>
                <FormControl>
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

        {/* TODO: choose date and time */}
        <FormField
          control={form.control}
          name="expiry"
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
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < tomorrow || date > oneMonthFromNow
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* TODO: TBD - category should be dropdown if only admin can set */}
        <Button type="submit">Open Bounty</Button>

        <p className="text-sm text-muted-foreground">
          By confirming to open the bounty, you hereby acknowledge that you have read and accept our {" "}
          <a href={TERMS_OF_SERVICE_URL} rel="noreferrer noopener" target="_blank" className="transition-colors text-foreground/60 underline hover:text-foreground/80">
            Terms of Service
          </a> and <a href={PRIVACY_POLICY_URL} rel="noreferrer noopener" target="_blank" className="transition-colors text-foreground/60 underline hover:text-foreground/80">
            Privacy Policy
          </a>.
        </p>
      </form>
    </Form>
  )
}
