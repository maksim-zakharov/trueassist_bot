import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("w-full h-[50px] [display:block] overflow-visible separator-shadow-bottom", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "p-0 gap-8 bg-transparent flex h-[50px] overflow-x-auto no-scrollbar bg-tg-theme-secondary-bg-color px-4 separator-shadow-bottom",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-block whitespace-nowrap group text-[15px] [line-height:18px] font-medium text-tg-theme-hint-color data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors data-[state=active]:[color:var(--tg-theme-accent-text-color)]",
        className
      )}
      {...props}
    >
      {props.children}
      <span className="absolute left-0 right-0 bottom-0 rounded-t-sm h-[3px] bg-tg-theme-button-color transition-opacity opacity-0 group-data-[state=active]:opacity-100" />
    </TabsPrimitive.Trigger>
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
