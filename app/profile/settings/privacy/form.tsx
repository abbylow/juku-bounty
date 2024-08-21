"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import Link from "next/link";
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"
import { useCeramicContext } from "@/components/ceramic/ceramic-provider"
import { IPrivacySettings } from "@/components/ceramic/types";
import { PROFILE_SETTINGS_URL } from "@/const/links";

// TODO: extract enum
// TODO: when allow no one to refer, turn off both switches of the quests (?)
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

export function ProfilePrivacyForm() {
  const { composeClient, viewerProfile } = useCeramicContext();
  // console.log('privacy:: viewerProfile privacySettings = ', viewerProfile?.privacySettings)

  const queryClient = useQueryClient();

  const [settingsClone, setSettingsClone] = useState<IPrivacySettings | undefined>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // pre-populate form fields with current data
    if (viewerProfile?.privacySettings && !settingsClone) {
      // console.log('privacy:: pre populating ', { ...viewerProfile.privacySettings })
      setSettingsClone({ ...viewerProfile.privacySettings })
    }
    // set loading to true when it's still getting viewer profile
    if (viewerProfile !== undefined) {
      setLoading(false)
    }
  }, [viewerProfile, settingsClone])

  const defaultValues: Partial<PrivacyFormValues> = {
    allowReferGroup: "anyone",
    allowReferKnowledgeBounty: true,
    allowReferConsultation: true,
    allowViewPortfolioGroup: "anyone",
    allowViewWorkExperience: true,
    allowViewSkillAttestation: true,
    allowViewPeerRecommendation: true,
  }

  const form = useForm<PrivacyFormValues>({
    resolver: zodResolver(privacyFormSchema),
    defaultValues,
    values: settingsClone,
    mode: "onBlur",
  })

  const onSubmit = async (data: PrivacyFormValues) => {
    console.log('privacy:: onSubmit data = ', { data })
    setLoading(true);
    // TODO: remove privacySettings created
    const update = await composeClient.executeQuery(`
      mutation {
        updateProfile(
          input: {
            id: "${viewerProfile?.id}"
            content: {
              privacySettings: {
                created: "${new Date().toISOString()}",
                allowReferConsultation: ${data.allowReferConsultation}, 
                allowReferGroup: "${data.allowReferGroup}",
                allowReferKnowledgeBounty: ${data.allowReferKnowledgeBounty},
                allowViewPeerRecommendation: ${data.allowViewPeerRecommendation},
                allowViewPortfolioGroup: "${data.allowViewPortfolioGroup}",
                allowViewSkillAttestation: ${data.allowViewSkillAttestation},
                allowViewWorkExperience: ${data.allowViewWorkExperience}
              }
            }
          }
        ) {
          document {
            id
            privacySettings {
              allowReferConsultation
              allowViewWorkExperience
              allowReferGroup
              allowReferKnowledgeBounty
              allowViewPeerRecommendation
              allowViewPortfolioGroup
              allowViewSkillAttestation
            }
          }
        }
      }
    `);

    if (update?.errors) {
      console.log('privacy:: graphql error', update.errors)
      toast({ title: `Something went wrong: ${update.errors}` })
    } else {
      toast({ title: "Updated privacy settings" })
      setLoading(true);
      queryClient.invalidateQueries({ queryKey: ['retrieveViewerProfile'] })
    }
    setLoading(false);
  }

  // prompt user to create profile first 
  if (viewerProfile === null) {
    return (
      <section>
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl font-medium">Set up your basic profile first</h3>
            <Link href={PROFILE_SETTINGS_URL} className={buttonVariants({ variant: "outline" })}>
              Set up profile
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h3 className="mb-4 text-base font-medium">Control how others refer you to quests</h3>
          <div className="space-y-4">
            <FormField
              disabled={loading}
              control={form.control}
              name="allowReferGroup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Who can refer me to quests</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={loading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a group" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="anyone">Anyone</SelectItem>
                      <SelectItem value="connections">My connections only</SelectItem>
                      <SelectItem value="noOne">No one</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
              control={form.control}
              name="allowViewPortfolioGroup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Who can view my portfolio</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={loading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a group" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="anyone">Anyone</SelectItem>
                      <SelectItem value="connectionsAndQuesters">My connections & questers only</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={loading}
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={loading}
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={loading}
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
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <Button type="submit" disabled={loading}>
          Save changes
        </Button>
      </form>
    </Form>
  )
}
