import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-none focus-visible:outline-none tg-input-border bg-tg-theme-section-bg-color p-[14px]",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
