import * as React from "react"
import { cn } from "@/lib/utils"

// 🌟 Table Root
const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto rounded-lg border border-custom-slate-200 bg-white">
    <table
      ref={ref}
      className={cn("w-full text-sm text-custom-slate-800", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

// 🌟 Header
const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      "bg-custom-slate-50 text-xs uppercase tracking-wide text-custom-slate-500 [&_tr]:border-b [&_tr]:border-custom-slate-200",
      className
    )}
    {...props}
  />
))
TableHeader.displayName = "TableHeader"

// 🌟 Body
const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0 text-sm", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

// 🌟 Footer
const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t border-custom-slate-200 bg-custom-slate-50 text-custom-slate-700 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

// 🌟 Row
const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-custom-slate-100 transition-colors hover:bg-custom-slate-50 data-[state=selected]:bg-custom-slate-100",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

// 🌟 Head Cell
const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-6 text-left align-middle font-semibold text-custom-slate-600",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

// 🌟 Cell
const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "px-6 py-3 align-middle text-sm text-custom-slate-800 [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableCell.displayName = "TableCell"

// 🌟 Caption
const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-xs text-custom-slate-500", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
