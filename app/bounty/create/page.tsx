// TODO: if user is not logged, prompt user to login
import { BountyForm } from "@/app/bounty/create/form";

export default function BountyCreation() {
  return (
    <section>
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-xl font-medium">Open a Knowledge Bounty</h3>
          <p className="text-sm text-muted-foreground">
            Raise a request in the public to get feedback from other contributors  
          </p>
        </div>
        <BountyForm />
      </div>
    </section>
  )
}
