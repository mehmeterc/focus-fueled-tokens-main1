import * as React from "react"
import { cn } from "@/lib/utils"

const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("animate-pulse rounded-md bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-antiapp-teal", className)}
    role="status"
    aria-busy="true"
    tabIndex={0}
    {...props}
  />
))

export { Skeleton }
