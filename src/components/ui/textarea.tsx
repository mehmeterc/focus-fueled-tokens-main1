import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

type AccessibleTextareaProps = TextareaProps & {
  invalid?: boolean;
  "aria-describedby"?: string;
};

const Textarea = React.forwardRef<HTMLTextAreaElement, AccessibleTextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 focus:border-antiapp-teal focus:ring-2 focus:ring-antiapp-teal",
          props.invalid && "border-destructive text-destructive focus-visible:ring-destructive",
          className
        )}
        aria-invalid={props.invalid}
        aria-describedby={props['aria-describedby']}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
