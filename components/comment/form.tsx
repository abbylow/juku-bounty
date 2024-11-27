"use client"

import { useQueryClient } from "@tanstack/react-query"
import { MessageSquare } from "lucide-react"
import { useState } from "react"

import { createComment } from "@/actions/comment/createComment"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { useViewerContext } from "@/contexts/viewer"

export default function CommentForm({ contributionId, bountyId }: { contributionId: number, bountyId: string }) {
  const { viewer } = useViewerContext();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);

  const [commentDesc, setCommentDesc] = useState("");
  const handleDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentDesc(e.target.value)
  }

  const handleSubmission = async () => {
    try {
      await createComment({
        contributionId: contributionId,
        creatorProfileId: viewer?.id!,
        description: commentDesc,
      })
      setDialogOpen(false);
      setCommentDesc("");
      toast({ title: "Successfully commented." });
      queryClient.invalidateQueries({ queryKey: ['fetchBounty', bountyId] })
    } catch (error) {
      console.log("Something went wrong")
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <div className="flex gap-2 text-sm text-muted-foreground">
          <Button variant="ghost" size="sm">
            <MessageSquare className="mr-2 h-4 w-4" />
            Comment
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:w-5/6">
        <DialogHeader>
          <DialogTitle>Comment on Contribution</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="response">
              Enter your response
            </Label>
            <Textarea
              id="response"
              className="resize-y h-40"
              value={commentDesc}
              onChange={handleDescChange}
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