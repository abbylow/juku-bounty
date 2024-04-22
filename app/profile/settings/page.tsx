import { Separator } from "@/components/ui/separator";

export default function ProfileSettings() {
  return (
    <section>
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">{"My Settings > Profile"}</h3>
          <p className="text-muted-foreground">
            Enrich your Juku profile to increase your chance for winning quests by showcasing your experience and skills
          </p>
        </div>
        <Separator />
        <div>form here</div>
      </div>
    </section>
  )
}
