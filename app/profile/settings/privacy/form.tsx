"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link";
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"

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
import { PROFILE_SETTINGS_URL } from "@/const/links";
import { useViewerContext } from "@/contexts/viewer";
import { upsertPrivacySettings } from "@/actions/privacySettings/upsertPrivacySettings";
import { getPrivacySettings } from "@/actions/privacySettings/getPrivacySettings";
import { PrivacyFormValues, privacyFormSchema } from '@/app/profile/settings/privacy/form-schema';

// TODO: when allow no one to refer, turn off both switches of the quests (?)
export function ProfilePrivacyForm() {  
  const { viewer } = useViewerContext()
  const { data: privacySettings, isPending } = useQuery({
    queryKey: ['fetchPrivacySettings', viewer?.id],
    queryFn: async () => await getPrivacySettings({ profile_id: viewer?.id }),
    enabled: !!(viewer?.id)
  })
  
  const [settingsClone, setSettingsClone] = useState<PrivacyFormValues>();
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // pre-populate form fields with current data
    if (privacySettings && !settingsClone) {
      setSettingsClone({
        allowReferGroup: privacySettings.allow_refer_group || "anyone",
        allowReferKnowledgeBounty: privacySettings.allow_refer_knowledge_bounty,
        allowReferConsultation: privacySettings.allow_refer_consultation,
        allowViewPortfolioGroup: privacySettings.allow_view_portfolio_group || "anyone",
        allowViewWorkExperience: privacySettings.allow_view_work_experience,
        allowViewSkillAttestation: privacySettings.allow_view_skill_attestation,
        allowViewPeerRecommendation: privacySettings.allow_view_peer_recommendation
      })
    }
    // set loading to true when it's still getting privacy settings
    if (!isPending) {
      setLoading(false)
    }
  }, [privacySettings, isPending, settingsClone])

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
    try {
      const updatedPrivacySettings = await upsertPrivacySettings({
        profileId: viewer?.id!,
        allowReferGroup: data.allowReferGroup,
        allowReferKnowledgeBounty: data.allowReferKnowledgeBounty,
        allowReferConsultation: data.allowReferConsultation,
        allowViewPortfolioGroup: data.allowViewPortfolioGroup,
        allowViewWorkExperience: data.allowViewWorkExperience,
        allowViewSkillAttestation: data.allowViewSkillAttestation,
        allowViewPeerRecommendation: data.allowViewPeerRecommendation
      })
      console.log({ updatedPrivacySettings })
      toast({ title: "Updated privacy settings" })
    } catch (error) {
      toast({ title: `Something went wrong: ${error}` })
    } finally {
      setLoading(false);
    }
  }

  // prompt user to create profile first 
  if (viewer === null) {
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
