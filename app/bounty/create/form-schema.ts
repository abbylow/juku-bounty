import { z } from "zod"
import { optionSchema } from '@/components/ui/multiple-selector';
import { ACCEPTABLE_CURRENCIES, MAX_NUM_OF_TAGS, oneMonthFromNow, tomorrow } from "@/app/bounty/create/const"
import { CATEGORY_OPTIONS } from "@/const/categories"

export const bountyFormSchema = z.object({
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
  category: z.enum(CATEGORY_OPTIONS.map(option => option.value) as [string, ...string[]], {
    invalid_type_error: "Select a category",
    required_error: "Please select a category.",
  }),
  tags: z.array(optionSchema)
    .max(MAX_NUM_OF_TAGS, { message: " Only allow maximum 5 tags" })
    .optional()
    .refine(array => new Set(array).size === array?.length, {
      message: "All tags must be unique",
    })
})


export type BountyFormValues = z.infer<typeof bountyFormSchema>

export const defaultValues: Partial<BountyFormValues> = {
  title: "",
  description: "",
  rewardCurrency: ACCEPTABLE_CURRENCIES.USDC,
  amountPerRewarder: 10,
  numberOfRewarders: 1,
  expiry: oneMonthFromNow,
}