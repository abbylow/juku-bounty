import { cookies } from "next/headers";
import { ProfileForm } from "@/app/profile/settings/form";
import { Separator } from "@/components/ui/separator";
import ProfileSetupPrompt from "@/components/profile/setup-prompt";

const _cookies = cookies()

export default function ProfileSettings() {  
  return (
    <section>
      <div className="space-y-6">
        <ProfileSetupPrompt />
        <div className="space-y-2">
          <h3 className="text-lg font-medium">{"My Settings > Profile"}</h3>
          <p className="text-sm text-muted-foreground">
            Enrich your Juku profile to increase your chance for winning quests by showcasing your experience and skills
          </p>
        </div>
        <Separator />
        <ProfileForm />
      </div>
    </section>
  )
}
