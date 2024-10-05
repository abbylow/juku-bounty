import { z } from "zod"
import { optionSchema } from '@/components/ui/multiple-selector';

export const profileFormSchema = z.object({
  username: z
    .string()
    .min(3, {
      message: "Display name must be at least 3 characters.",
    })
    .max(100, {
      message: "Display name must not be longer than 100 characters.",
    })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Your username can only contain letters, numbers and '_'",
    }),
  displayName: z
    .string()
    .min(3, {
      message: "Display name must be at least 3 characters.",
    })
    .max(100, {
      message: "Display name must not be longer than 100 characters.",
    }),
  bio: z
    .string()
    .max(160, {
      message: "About me must not be longer than 160 characters.",
    })
    .optional(),
  categories: z.array(optionSchema)
    // .min(1, {
    //   message: "Choose at least 1 category for discovery"
    // })
    .max(3, {
      message: "Only allow maximum 3 categories"
    }),
})