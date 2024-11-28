import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function BountyAlertDialog({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Important Notice</AlertDialogTitle>
          <AlertDialogDescription>
            {`Don't close or refresh this page when you're closing a bounty. Otherwise, you may cause the bounty to be closed unsuccessfully. Check your wallet prompted action.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setOpen(false)}>Noted</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}