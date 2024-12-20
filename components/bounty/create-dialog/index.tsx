import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function BountyCreateDialog({ disabled }: { disabled: boolean }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" disabled={disabled}>Open Bounty</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Open Bounty</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <h3>
            {`Your bounty reward will be held temporarily and claimed by the chosen winner upon quest completion. `}
          </h3>
          <h3>
            {`For incomplete quest, you can claim your reward after quest expires or ends and no platform fee will be charged.`}
          </h3>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Label htmlFor="name" className="col-span-3">
                Name
              </Label>
            </div>
          </div>
        </DialogDescription>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}