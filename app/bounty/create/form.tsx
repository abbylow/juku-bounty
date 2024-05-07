// "use client"

// import { zodResolver } from "@hookform/resolvers/zod"
// import { CalendarIcon, ChevronDownIcon } from "@radix-ui/react-icons"
// import { format } from "date-fns"
// import { useForm } from "react-hook-form"
// import { z } from "zod"

// import { cn } from "@/lib/utils"
// import { Button, buttonVariants } from "@/components/ui/button"
// import { Calendar } from "@/components/ui/calendar"
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form"
// import { Input } from "@/components/ui/input"
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover"
// import { toast } from "@/components/ui/use-toast"
// import { Textarea } from "@/components/ui/textarea"
// import { PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } from "@/const/links"

// // TODO: read this https://ui.shadcn.com/docs/components/form 
// // TODO: change select to this? https://ui.shadcn.com/docs/components/select#form
// // TODO: check validation rule
// // TODO: cautious to store the local time of the expiry date
// const tomorrow = new Date();
// tomorrow.setDate(tomorrow.getDate() + 1);

// const oneMonthFromNow = new Date();
// oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

// const ACCEPTABLE_CURRENCIES = ["usdc", "usdt"] as const;
// const MAX_NUM_OF_TAGS = 5;

// const bountyFormSchema = z.object({
//   title: z
//     .string()
//     .min(5, {
//       message: "Name must be at least 5 characters.",
//     })
//     .max(80, {
//       message: "Name must not be longer than 80 characters.",
//     }),
//   description: z
//     .string()
//     .min(2, {
//       message: "Name must be at least 2 characters.",
//     })
//     .max(1000, {
//       message: "Name must not be longer than 1000 characters.",
//     }),
//   rewardCurrency: z.enum(ACCEPTABLE_CURRENCIES, {
//     invalid_type_error: "Select a currency",
//     required_error: "Please select a currency.",
//   }),
//   amountPerRewarder: z.number()
//     .positive({ message: "Number must be greater than zero" }),
//   numberOfRewarders: z.number()
//     .min(1, { message: "Value must be at least 1" })
//     .max(10, { message: "Value must be no more than 10" }),
//   expiry: z.date()
//     .refine(date => date >= tomorrow, { // Checks if the date is at least one day in the future
//       message: "Expiry date must be at least one day in the future",
//     })
//     .refine(date => date <= oneMonthFromNow, { // Checks if the date is within one month
//       message: "Expiry date must be within one month from now",
//     }),
//   categories: z.array(z.string())
//     .max(MAX_NUM_OF_TAGS, { message: "Categories can contain no more than 5 tags" })
//     .optional()
//     .refine(array => new Set(array).size === array?.length, {
//       message: "All tags in the categories must be unique",
//     })
// })

// type BountyFormValues = z.infer<typeof bountyFormSchema>

// export function BountyForm() {
//   const form = useForm<BountyFormValues>({
//     resolver: zodResolver(bountyFormSchema),
//     mode: "onChange",
//   })

//   function onSubmit(data: BountyFormValues) {
//     toast({
//       title: "You submitted the following values:",
//       description: (
//         <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
//           <code className="text-white">{JSON.stringify(data, null, 2)}</code>
//         </pre>
//       ),
//     })
//   }

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
//         <FormField
//           control={form.control}
//           name="title"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Title</FormLabel>
//               <FormControl>
//                 <Input
//                   placeholder="Insert a catchy title to summarize your quest"
//                   {...field}
//                 />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <FormField
//           control={form.control}
//           name="description"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Description</FormLabel>
//               <FormControl>
//                 <Textarea
//                   placeholder="Provide context for your quest, state your quest completion goal and reward criteria clearly."
//                   className="resize-none"
//                   {...field}
//                 />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <div className="flex flex-wrap gap-4">
//           <FormField
//             control={form.control}
//             name="numberOfRewarders"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Number of Rewarders</FormLabel>
//                 <FormControl>
//                   <Input
//                     type="number"
//                     min={1}
//                     max={10}
//                     step={1}
//                     {...field}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name="rewardCurrency"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Currency</FormLabel>
//                 <div className="relative w-max">
//                   <FormControl>
//                     <select
//                       className={cn(
//                         buttonVariants({ variant: "outline" }),
//                         "w-[200px] appearance-none font-normal"
//                       )}
//                       {...field}
//                     >
//                       {
//                         ACCEPTABLE_CURRENCIES.map(c => (
//                           <option value={c} key={c}>{c.toUpperCase()}</option>
//                         ))
//                       }
//                     </select>
//                   </FormControl>
//                   <ChevronDownIcon className="absolute right-3 top-2.5 h-4 w-4 opacity-50" />
//                 </div>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name="amountPerRewarder"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Amount per Rewarder</FormLabel>
//                 <FormControl>
//                   <Input
//                     type="number"
//                     {...field}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         </div>

//         {/* TODO: choose date and time */}
//         <FormField
//           control={form.control}
//           name="expiry"
//           render={({ field }) => (
//             <FormItem className="flex flex-col">
//               <FormLabel>Expiry Date</FormLabel>
//               <Popover>
//                 <PopoverTrigger asChild>
//                   <FormControl>
//                     <Button
//                       variant={"outline"}
//                       className={cn(
//                         "w-[240px] pl-3 text-left font-normal",
//                         !field.value && "text-muted-foreground"
//                       )}
//                     >
//                       {field.value ? (
//                         format(field.value, "PPP")
//                       ) : (
//                         <span>Pick a date</span>
//                       )}
//                       <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                     </Button>
//                   </FormControl>
//                 </PopoverTrigger>
//                 <PopoverContent className="w-auto p-0" align="start">
//                   <Calendar
//                     mode="single"
//                     selected={field.value}
//                     onSelect={field.onChange}
//                     disabled={(date) =>
//                       date < tomorrow || date > oneMonthFromNow
//                     }
//                     initialFocus
//                   />
//                 </PopoverContent>
//               </Popover>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         {/* TODO: TBD - category should be dropdown if only admin can set */}
//         <Button type="submit">Open Bounty</Button>

//         <p className="text-sm text-muted-foreground">
//           By confirming to open the bounty, you hereby acknowledge that you have read and accept our {" "}
//           <a href={TERMS_OF_SERVICE_URL} rel="noreferrer noopener" target="_blank" className="transition-colors text-foreground/60 underline hover:text-foreground/80">
//             Terms of Service
//           </a> and <a href={PRIVACY_POLICY_URL} rel="noreferrer noopener" target="_blank" className="transition-colors text-foreground/60 underline hover:text-foreground/80">
//             Privacy Policy
//           </a>.
//         </p>
//       </form>
//     </Form>
//   )
// }


// TODO: switch back to react-hook-form and zod
// NOTE: the form below is without validation

"use client"

// import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, ChevronDownIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"
// import { z } from "zod"
import { useRouter } from 'next/navigation'

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } from "@/const/links"
import { Label } from "@/components/ui/label"
import { useCeramicContext } from "@/components/ceramic/ceramic-provider"
import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Profile } from "@/app/profile/settings/form"

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

// const bountyFormSchema = z.object({
//   title: z
//     .string()
//     .min(5, {
//       message: "Name must be at least 5 characters.",
//     })
//     .max(80, {
//       message: "Name must not be longer than 80 characters.",
//     }),
//   description: z
//     .string()
//     .min(2, {
//       message: "Name must be at least 2 characters.",
//     })
//     .max(1000, {
//       message: "Name must not be longer than 1000 characters.",
//     }),
//   rewardCurrency: z.enum(ACCEPTABLE_CURRENCIES, {
//     invalid_type_error: "Select a currency",
//     required_error: "Please select a currency.",
//   }),
//   amountPerRewarder: z.number()
//     .positive({ message: "Number must be greater than zero" }),
//   numberOfRewarders: z.number()
//     .min(1, { message: "Value must be at least 1" })
//     .max(10, { message: "Value must be no more than 10" }),
//   expiry: z.date()
//     .refine(date => date >= tomorrow, { // Checks if the date is at least one day in the future
//       message: "Expiry date must be at least one day in the future",
//     })
//     .refine(date => date <= oneMonthFromNow, { // Checks if the date is within one month
//       message: "Expiry date must be within one month from now",
//     }),
//   categories: z.array(z.string())
//     .max(MAX_NUM_OF_TAGS, { message: "Categories can contain no more than 5 tags" })
//     .optional()
//     .refine(array => new Set(array).size === array?.length, {
//       message: "All tags in the categories must be unique",
//     })
// })

// type BountyFormValues = z.infer<typeof bountyFormSchema>

type Bounty = {
  id?: any
  title?: string
  description?: string
  numberOfRewarders?: number
  rewardCurrency?: string
  amountPerRewarder?: number
  expiry?: Date
}

export function BountyForm() {
  const { composeClient, profile } = useCeramicContext();

  const router = useRouter()

  const [bountyInput, setBountyInput] = useState<Bounty | undefined | null>();

  const [loading, setLoading] = useState<boolean>(false);

  const createBounty = async (e: any) => {
    e.preventDefault()
    if (!profile) {
      console.log('no profile => ', profile)
    } else {
      console.log("before submission ", { profile, bountyInput })

      setLoading(true);

      // TODO: change this mutation to setBasicProfile as createBasicProfile is deprecated soon
      const update = await composeClient.executeQuery(`
          mutation {
            createBounties(input: {
              content: {
                title: "${bountyInput?.title || ""}"
                description: "${bountyInput?.description?.replace(/\n/g, "\\n") || ""}"
                numberOfRewarders: ${bountyInput?.numberOfRewarders || ""}
                rewardCurrency: "${bountyInput?.rewardCurrency || ""}"
                amountPerRewarder: ${bountyInput?.amountPerRewarder || ""}
                expiry: "${bountyInput?.expiry?.toISOString() || ""}"
                created: "${new Date().toISOString()}"
                profileId: "${profile.id}"
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
      console.log({ update })
      if (update.errors) {
        toast({ title: `Something went wrong: ${update.errors}` })
      } else {
        toast({ title: "Updated bounty" })
        setLoading(true);

        const createdBounty: any = update?.data?.createBounties
        if (createdBounty?.document?.id) {
          console.log(createdBounty.document.id)
          router.push(`/bounty/${createdBounty.document.id}`)
        }
      }
      setLoading(false);
    }
  };
  return (
    <form className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          placeholder="Insert a catchy title to summarize your quest"
          name="title"
          disabled={loading || !profile}
          onChange={(e) => {
            setBountyInput({ ...bountyInput, title: e.target.value });
          }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          placeholder="Provide context for your quest, state your quest completion goal and reward criteria clearly."
          className="resize-none"
          name="description"
          disabled={loading || !profile}
          onChange={(e) => {
            setBountyInput({ ...bountyInput, description: e.target.value });
          }}
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="space-y-2">
          <Label htmlFor="numberOfRewarders">Number of Rewarders</Label>
          <Input
            type="number"
            min={1}
            max={10}
            step={1}
            name="numberOfRewarders"
            disabled={loading || !profile}
            onChange={(e) => {
              setBountyInput({ ...bountyInput, numberOfRewarders: +(e.target.value) });
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rewardCurrency">Currency</Label>
          <Select
            name="rewardCurrency"
            disabled={loading || !profile}
            onValueChange={(value) => {
              setBountyInput({ ...bountyInput, rewardCurrency: value });
            }}
          >
            <SelectTrigger className="w-[200px] appearance-none font-normal">
              <SelectValue placeholder="Select a currency" />
            </SelectTrigger>
            <SelectContent>
              {
                ACCEPTABLE_CURRENCIES.map(c => (
                  <SelectItem value={c} key={c}>{c.toUpperCase()}</SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amountPerRewarder">Amount per Rewarder</Label>
          <Input
            type="number"
            name="amountPerRewarder"
            disabled={loading || !profile}
            onChange={(e) => {
              setBountyInput({ ...bountyInput, amountPerRewarder: +(e.target.value) });
            }}
          />
        </div>
      </div>

      {/* TODO: handle the date time in UTC */}
      <div className="space-y-2 flex flex-col">
        <Label htmlFor="expiry">Expiry Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] pl-3 text-left font-normal"
              )}
            >
              {bountyInput?.expiry ? (
                format(bountyInput?.expiry, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              onSelect={(value) => {
                setBountyInput({ ...bountyInput, expiry: value });
              }}
              disabled={(date) =>
                date < tomorrow || date > oneMonthFromNow
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* TODO: TBD - category should be dropdown if only admin can set */}

      <Button
        onClick={createBounty}
        disabled={loading || !profile}
      >
        Open Bounty
      </Button>

      <p className="text-sm text-muted-foreground">
        By confirming to open the bounty, you hereby acknowledge that you have read and accept our {" "}
        <a href={TERMS_OF_SERVICE_URL} rel="noreferrer noopener" target="_blank" className="transition-colors text-foreground/60 underline hover:text-foreground/80">
          Terms of Service
        </a> and <a href={PRIVACY_POLICY_URL} rel="noreferrer noopener" target="_blank" className="transition-colors text-foreground/60 underline hover:text-foreground/80">
          Privacy Policy
        </a>.
      </p>
    </form>
  )
}
