"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

function TooltipProvider({
  delayDuration = 200,
  skipDelayDuration = 100,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
      {...props}
    />
  )
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  )
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  sideOffset = 8,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          // Layout & sizing
          "z-[9999] w-fit max-w-[240px] origin-(--radix-tooltip-content-transform-origin)",
          "rounded-lg px-3 py-2",
          // Glassmorphism: dark glass with blur
          "bg-slate-900/95 dark:bg-slate-800/95",
          "backdrop-blur-xl",
          "border border-slate-700/40 dark:border-slate-600/40",
          "shadow-[0_8px_32px_rgba(0,0,0,0.28),0_2px_8px_rgba(0,0,0,0.12)]",
          // Typography
          "text-[13px] leading-snug font-medium text-slate-100 text-balance",
          // Animation: scale-in with spring-like overshoot + directional slide
          "animate-in fade-in-0 zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "data-[side=top]:slide-in-from-bottom-2",
          "data-[side=bottom]:slide-in-from-top-2",
          "data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2",
          // Timing curve: ease-out for snappy feel
          "duration-200 ease-out",
          // Prevent text selection on tooltip
          "select-none",
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow
          width={12}
          height={6}
          className="fill-slate-900/95 dark:fill-slate-800/95 drop-shadow-sm"
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
