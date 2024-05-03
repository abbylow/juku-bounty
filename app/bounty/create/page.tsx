// TODO: if user is not logged, prompt user to login
import { Separator } from "@/components/ui/separator";
import { BountyForm } from "@/app/bounty/create/form";

export default function BountyCreation() {
  return (
    <section>
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-xl font-medium">Open a Knowledge Bounty</h3>
          {/* <p className="text-sm text-muted-foreground">
            Describe how a knowledge bounty should look like (TBD)
          </p> */}
        </div>
        {/* <Separator /> */}
        <BountyForm />
      </div>
    </section>
  )
}
