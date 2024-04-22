import { Separator } from "@/components/ui/separator";
import { ProfileIntegrationForm } from "@/app/profile/settings/integration/form";

export default function ProfileSettingsIntegration() {
  return (
    <section>
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">{"My Settings > Integration"}</h3>
          <p className="text-sm text-muted-foreground">
            {/* TODO: this copy here mismatches the purpose of integration */}
            Connect to your wallet to start creating quests or receive rewards.
          </p>
        </div>
        <Separator />
        <ProfileIntegrationForm />
      </div>
    </section>
  )
}
