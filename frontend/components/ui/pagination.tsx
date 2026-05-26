import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  )
}

function PaginationItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="pagination-item"
      className={cn("", className)}
      {...props}
    />
  )
}

type PaginationLinkProps = {
  isActive?: boolean
} & React.ComponentProps<typeof Link>

function PaginationLink({
  className,
  isActive,
  ...props
}: PaginationLinkProps) {
  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      className={cn(
        buttonVariants({
          variant: isActive ? "default" : "outline",
          size: "icon-sm",
        }),
        isActive 
          ? "bg-glanz-gold text-glanz-black border-transparent font-extrabold shadow-md shadow-glanz-gold/15" 
          : "border-slate-200 dark:border-charcoal text-slate-600 dark:text-cream hover:bg-slate-100 dark:hover:bg-charcoal/50",
        className
      )}
      {...props}
    />
  )
}

function PaginationPrevious({
  className,
  text = "Previous",
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      className={cn("gap-1 pl-2.5 size-auto h-8 px-3 rounded-lg border border-slate-200 dark:border-charcoal text-slate-600 dark:text-cream hover:bg-slate-100 dark:hover:bg-charcoal/50 text-xs font-semibold", className)}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="hidden sm:block">{text}</span>
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  text = "Next",
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      className={cn("gap-1 pr-2.5 size-auto h-8 px-3 rounded-lg border border-slate-200 dark:border-charcoal text-slate-600 dark:text-cream hover:bg-slate-100 dark:hover:bg-charcoal/50 text-xs font-semibold", className)}
      {...props}
    >
      <span className="hidden sm:block">{text}</span>
      <ChevronRight className="h-4 w-4" />
    </PaginationLink>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex h-8 w-8 items-center justify-center text-slate-400 dark:text-cream/40", className)}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
