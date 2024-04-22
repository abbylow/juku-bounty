import { Separator } from "@/components/ui/separator";

export default function ProfileSettingsPrivacy() {
  return (
    <section>
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">{"My Settings > Privacy"}</h3>
          <p className="text-sm text-muted-foreground">
            Control how others refer you to quests
          </p>
        </div>
        <Separator />
        <div>privacy form here</div>
      </div>
    </section>
  )
}
