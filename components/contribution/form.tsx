"use client"

import { Lightbulb, Info } from "lucide-react"
import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react"

import { createContribution } from "@/actions/contribution/createContribution"
import { getProfiles } from "@/actions/profile/getProfiles"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import MultipleSelector, { Option } from '@/components/ui/multiple-selector'
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/components/ui/use-toast"
import { useViewerContext } from "@/contexts/viewer"

export default function ContributionForm({ bountyId }: { bountyId: string }) {
  const router = useRouter();
  const { viewer } = useViewerContext();

  const [dialogOpen, setDialogOpen] = useState(false);

  const [contributionDescDisabled, setContributionDescDisabled] = useState(false);

  const [contributionDesc, setContributionDesc] = useState("");
  const handleDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContributionDesc(e.target.value)
  }

  const [referee, setReferee] = useState<Option[]>();

  useEffect(() => {
    if (referee?.length) {
      setContributionDescDisabled(true);
      setContributionDesc(`I refer ${referee[0].label} to contribute to this quest`);
    } else {
      setContributionDescDisabled(false);
    }
  }, [referee])


  const searchUsers = async (value: string): Promise<Option[]> => {
    const response = await getProfiles({
      username: value,
      display_name: value,
    });

    // TODO: for users that have disabled referral, user will not be able to choose and refer them and see the “Referral disabled” tag
    const options = response.filter(el => el.id !== viewer?.id).map((profile) => ({
      value: profile.id,
      label: `${profile.display_name} @${profile.username}`, // Combine display name and username for the label
    }));
    return options;
  };

  const handleSubmission = async () => {
    try {
      await createContribution({
        bountyId: bountyId,
        creatorProfileId: viewer?.id!,
        description: contributionDesc,
        refereeId: referee ? referee[0].value : ''
      })
      setDialogOpen(false);
      setContributionDesc("");
      setReferee([]);
      toast({ title: "Successfully created contribution." });
      router.push(`/bounty/${bountyId}`)
    } catch (error) {
      console.log("Something went wrong")
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Lightbulb className="mr-2 h-5 w-5" /> Contribute
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:w-5/6">
        <DialogHeader>
          <DialogTitle>Contribute to Bounty</DialogTitle>
          <DialogDescription>
            By submitting your response or refer a connection to contribute, a publicly visible thread will be opened among quester, you (and referrer) for any follow-up discussion.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="response" className="">
              Enter your response or provide any relevant links
            </Label>
            <Textarea
              id="response"
              className="resize-y h-40"
              value={contributionDesc}
              onChange={handleDescChange}
              disabled={contributionDescDisabled}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="referee" className="flex gap-1">
              Refer user to contribute (optional)
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>You will earn 20% of the rewards if your referral wins the bounty rewards</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <MultipleSelector
              value={referee}
              onChange={setReferee}
              maxSelected={1}
              onMaxSelected={(maxLimit) => {
                toast({ title: `You have reached max selected referee: ${maxLimit}` });
              }}
              onSearch={async (value) => {
                return await searchUsers(value);
              }}
              placeholder="Search by display name or username"
              loadingIndicator={
                <p className="py-2 text-center text-lg leading-10 text-muted-foreground">loading...</p>
              }
              emptyIndicator={
                <p className="w-full text-center text-lg leading-10 text-muted-foreground">
                  no user found.
                </p>
              }
              hideClearAllButton
            />
          </div>
        </div>
        <DialogFooter>
          <div className="flex flex-col gap-4">
            <Button type="submit" onClick={handleSubmission}>Submit</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}