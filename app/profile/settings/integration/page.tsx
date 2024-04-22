import { Separator } from "@/components/ui/separator";

export default function ProfileSettingsIntegration() {
  return (
    <section>
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">{"My Settings > Integration"}</h3>
          <p className="text-muted-foreground">
            Connect to your wallet to start creating quests or receive rewards.
          </p>
        </div>
        <Separator />
        <div>integration form here</div>
      </div>
    </section>
  )
}
