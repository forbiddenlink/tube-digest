import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary/20 selection:text-foreground",
        "h-11 w-full min-w-0 rounded-lg border-2 border-border bg-background/50 dark:bg-background/30 backdrop-blur-sm px-4 py-2 text-base shadow-sm",
        "transition-all duration-200 outline-none",
        "file:inline-flex file:h-8 file:border-0 file:bg-primary/10 file:text-sm file:font-medium file:rounded-md file:px-3 file:mr-3",
        "hover:border-primary/30 hover:bg-background/70 dark:hover:bg-background/40",
        "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:bg-background dark:focus-visible:bg-background/50",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
