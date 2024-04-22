import { Separator } from "@/components/ui/separator";
import { ProfilePrivacyForm } from "@/app/profile/settings/privacy/form";

export default function ProfileSettingsPrivacy() {
  return (
    <section>
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">{"My Settings > Privacy"}</h3>
          <p className="text-sm text-muted-foreground">
            Control how others refer you to quests or view your portfolio
          </p>
        </div>
        <Separator />
        <ProfilePrivacyForm />
      </div>
    </section>
  )
}
