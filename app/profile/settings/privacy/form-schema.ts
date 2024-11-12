import { z } from "zod"

export const ViewPortfolioGroupOption = {
  anyone: "anyone",
  connectionsAndQuesters: "connectionsAndQuesters",
} as const;

export type ViewPortfolioGroupOptionType = keyof typeof ViewPortfolioGroupOption;

export const ReferGroupOption = {
  anyone: "anyone",
  connectionsAndQuesters: "connections",
  noOne: "noOne"
} as const;

export type ReferGroupOptionType = keyof typeof ReferGroupOption;

export const privacyFormSchema = z.object({
  allowReferGroup: z.enum(Object.values(ReferGroupOption) as [string, ...string[]], {
    required_error: "Please select a group.",
  }),
  allowReferKnowledgeBounty: z.boolean(),
  allowReferConsultation: z.boolean(),
  allowViewPortfolioGroup: z.enum(Object.values(ViewPortfolioGroupOption) as [string, ...string[]], {
    required_error: "Please select a group.",
  }),
  allowViewWorkExperience: z.boolean(),
  allowViewSkillAttestation: z.boolean(),
  allowViewPeerRecommendation: z.boolean(),
})

export type PrivacyFormValues = z.infer<typeof privacyFormSchema>