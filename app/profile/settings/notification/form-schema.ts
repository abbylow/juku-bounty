import { z } from "zod"

export const notificationFormSchema = z.object({
  platformNewFeature: z.boolean(),
  platformNewQuest: z.boolean(),
  newContributionToInvolvedQuest: z.boolean(),
  newLikesToInvolvedQuest: z.boolean(),
  newRepliesToInvolvedQuest: z.boolean(),
  statusChangeToInvolvedQuest: z.boolean(),
  beMentioned: z.boolean()
})

export type NotificationFormValues = z.infer<typeof notificationFormSchema>