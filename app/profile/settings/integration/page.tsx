import { Separator } from "@/components/ui/separator";

export default function ProfileSettingsIntegration() {
  return (
    <section>
      <div className="space-y-6">
        <div className="space-y-2">
        <h3 className="text-lg font-medium">{"My Settings > Integration"}</h3>
          <p className="text-sm text-muted-foreground">
            Connect to your wallet to start creating quests or receive rewards.
          </p>
        </div>
        <Separator />
        <div>integration form here</div>
      </div>
    </section>
  )
}
