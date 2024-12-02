"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link";
import { useForm } from "react-hook-form"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { toast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"
import { PROFILE_SETTINGS_URL } from "@/const/links";
import { useEffect, useState } from "react";
import { useViewerContext } from "@/contexts/viewer";
import { NotificationFormValues, notificationFormSchema } from "@/app/profile/settings/notification/form-schema";
import { getNotificationSettings } from "@/actions/notificationSettings/getNotificationSettings";
import { upsertNotificationSettings } from "@/actions/notificationSettings/upsertNotificationSettings";

const defaultValues: Partial<NotificationFormValues> = {
  platformNewFeature: true,
  platformNewQuest: true,
  newContributionToInvolvedQuest: true,
  newLikesToInvolvedQuest: true,
  newRepliesToInvolvedQuest: true,
  statusChangeToInvolvedQuest: true,
  beMentioned: true
}

export function ProfileNotificationForm() {
  const { viewer } = useViewerContext()
  const { data: notificationSettings, isPending } = useQuery({
    queryKey: ['fetchNotificationSettings', viewer?.id],
    queryFn: async () => await getNotificationSettings({ profile_id: viewer?.id }),
    enabled: !!(viewer?.id)
  })

  const [settingsClone, setSettingsClone] = useState<NotificationFormValues>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // pre-populate form fields with current data
    if (notificationSettings && !settingsClone) {
      setSettingsClone({
        platformNewFeature: notificationSettings.platform_new_feature,
        platformNewQuest: notificationSettings.platform_new_quest,
        newContributionToInvolvedQuest: notificationSettings.new_contribution_to_involved_quest,
        newLikesToInvolvedQuest: notificationSettings.new_likes_to_involved_quest,
        newRepliesToInvolvedQuest: notificationSettings.new_replies_to_involved_quest,
        statusChangeToInvolvedQuest: notificationSettings.status_change_to_involved_quest,
        beMentioned: notificationSettings.be_mentioned
      })
    }
    // set loading to true when it's still getting notification settings
    if (isPending) {
      setLoading(false)
    }
  }, [notificationSettings, isPending, settingsClone])

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues,
    values: settingsClone,
    mode: "onBlur",
  })

  const onSubmit = async (data: NotificationFormValues) => {
    console.log('notifi:: onSubmit data = ', { data })
    setLoading(true);

    try {
      const updatedNotificationSettings = await upsertNotificationSettings({
        profileId: viewer?.id!,
        platformNewFeature: data.platformNewFeature,
        platformNewQuest: data.platformNewQuest,
        newContributionToInvolvedQuest: data.newContributionToInvolvedQuest,
        newLikesToInvolvedQuest: data.newLikesToInvolvedQuest,
        newRepliesToInvolvedQuest: data.newRepliesToInvolvedQuest,
        statusChangeToInvolvedQuest: data.statusChangeToInvolvedQuest,
        beMentioned: data.beMentioned,
      })
      console.log({ updatedNotificationSettings })
      toast({ title: "Updated notification settings" })
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
          <h3 className="mb-4 text-base font-medium">Platform Updates</h3>
          <div className="space-y-4">
            <FormField
              disabled={loading}
              control={form.control}
              name="platformNewFeature"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>
                      New features
                    </FormLabel>
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
              name="platformNewQuest"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>
                      New platform quests
                    </FormLabel>
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

        <div>
          <h3 className="mb-4 text-base font-medium">Quest Updates</h3>
          <div className="space-y-4">
            <FormField
              disabled={loading}
              control={form.control}
              name="newContributionToInvolvedQuest"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>
                      New contribution to your involved quests
                    </FormLabel>
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
              name="newLikesToInvolvedQuest"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>
                      New likes to your created quests
                    </FormLabel>
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
              name="newRepliesToInvolvedQuest"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>
                      New replies to your contributed quests
                    </FormLabel>
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
              name="statusChangeToInvolvedQuest"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>
                      Status change to your contributed quests
                    </FormLabel>
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
              name="beMentioned"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>
                      Be referred
                    </FormLabel>
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
        <Button type="submit" disabled={loading}>Save changes</Button>
      </form>
    </Form>
  )
}
