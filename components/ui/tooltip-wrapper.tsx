// this is not shadcn ui component
import { TooltipProvider, TooltipContent, TooltipTrigger, Tooltip } from '@/components/ui/tooltip';

export default function TooltipWrapper({
  trigger,
  triggerAsChild = true,
  tooltipContent,
}: {
  trigger: React.ReactNode,
  triggerAsChild?: boolean,
  tooltipContent: string
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild={triggerAsChild}>
          {trigger}
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}