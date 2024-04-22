"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { toast } from "@/components/ui/use-toast"
import { ChevronDownIcon } from "lucide-react"
import { Switch } from "@/components/ui/switch"

// TODO: update validation rules
// TODO: update onSubmit handling
// TODO: learn more about the form and zod library eg: meaning of mode: onchange 
// TODO: when allow no one to refer, turn off both switches of the quests
const privacyFormSchema = z.object({
  allowReferGroup: z.enum(["anyone", "connections", "noOne"], {
    required_error: "Please select a group.",
  }),
  allowReferKnowledgeBounty: z.boolean(),
  allowReferConsultation: z.boolean(),
  allowViewPortfolioGroup: z.enum(["anyone", "connectionsAndQuesters"], {
    required_error: "Please select a group.",
  }),
  allowViewWorkExperience: z.boolean(),
  allowViewSkillAttestation: z.boolean(),
  allowViewPeerRecommendation: z.boolean(),
})

type PrivacyFormValues = z.infer<typeof privacyFormSchema>

const defaultValues: Partial<PrivacyFormValues> = {
  allowReferGroup: "anyone",
  allowReferKnowledgeBounty: true,
  allowReferConsultation: true,
  allowViewPortfolioGroup: "anyone",
  allowViewWorkExperience: true,
  allowViewSkillAttestation: true,
  allowViewPeerRecommendation: true,
}

export function ProfilePrivacyForm() {
  const form = useForm<PrivacyFormValues>({
    resolver: zodResolver(privacyFormSchema),
    defaultValues,
    mode: "onChange",
  })

  function onSubmit(data: PrivacyFormValues) {
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
        <div>
          <h3 className="mb-4 text-base font-medium">Control how others refer you to quests</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="allowReferGroup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Who can refer me to quests</FormLabel>
                  <div className="relative w-max">
                    <FormControl>
                      <select
                        className={cn(
                          buttonVariants({ variant: "outline" }),
                          "w-[200px] appearance-none font-normal"
                        )}
                        {...field}
                      >
                        <option value="anyone">Anyone</option>
                        <option value="connections">My connections only</option>
                        <option value="noOne">No one</option>
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
              name="allowReferKnowledgeBounty"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>
                      Knowledge Bounty
                    </FormLabel>
                    <FormDescription>
                      Allow the selected users refer you to knowledge bounty
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="allowReferConsultation"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>
                      Private Consultation
                    </FormLabel>
                    <FormDescription>
                      Allow the selected users refer you to private consultation
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-base font-medium">Control how others view your portfolio</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="allowViewPortfolioGroup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Who can view my portfolio</FormLabel>
                  <div className="relative w-max">
                    <FormControl>
                      <select
                        className={cn(
                          buttonVariants({ variant: "outline" }),
                          "w-[200px] appearance-none font-normal"
                        )}
                        {...field}
                      >
                        <option value="anyone">Anyone</option>
                        <option value="connectionsAndQuesters">My connections & questers only</option>
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
              name="allowViewWorkExperience"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>
                      Work Experience
                    </FormLabel>
                    <FormDescription>
                      Allow the selected users view my work experience
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="allowViewSkillAttestation"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>
                      Skill Attestation
                    </FormLabel>
                    <FormDescription>
                      Allow the selected users view my skill attestation
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="allowViewPeerRecommendation"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>
                      Peer Recommendation
                    </FormLabel>
                    <FormDescription>
                    Allow the selected users view my peer recommendation
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        <Button type="submit">Update privacy</Button>
      </form>
    </Form>
  )
}
