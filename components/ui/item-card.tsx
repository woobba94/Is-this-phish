import * as React from "react"
import { cn } from "@/lib/utils"

const ItemCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-md border bg-card text-card-foreground shadow-sm h-full",
      className
    )}
    {...props}
  />
))
ItemCard.displayName = "ItemCard"

const ItemCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4", className)} {...props} />
))
ItemCardContent.displayName = "ItemCardContent"

export { ItemCard, ItemCardContent } 