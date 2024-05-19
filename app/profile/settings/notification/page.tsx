import { Separator } from "@/components/ui/separator";
import { ProfileNotificationForm } from "@/app/profile/settings/notification/form";

export default function ProfileSettingsNotification() {
  return (
    <section>
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">{"My Settings > Notification"}</h3>
          <p className="text-sm text-muted-foreground">
            Control how you receive notifications on Juku
          </p>
        </div>
        <Separator />
        <ProfileNotificationForm />
      </div>
    </section>
  )
}
