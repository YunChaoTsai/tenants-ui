import React from "react"
import { Omit } from "utility-types"

export function Container({
  fluid,
  className,
  as: Component = "div",
  ...props
}: Omit<React.HTMLProps<HTMLDivElement>, "as"> & {
  fluid: boolean
  as?: React.ReactType
}) {
  return (
    <Component
      className={`container${fluid ? "-fluid" : ""} ${
        className ? className : ""
      }`}
      {...props}
    />
  )
}

interface GridProps {
  as?: React.ReactType
  noGutters?: boolean
}

export function Grid({
  className,
  noGutters,
  as: Component = "div",
  ...props
}: Omit<React.HTMLProps<HTMLDivElement>, "as"> & GridProps) {
  return (
    <Component
      className={`row ${noGutters ? "no-gutters" : ""} ${
        className ? className : ""
      }`}
      {...props}
    />
  )
}

export function Col({
  className,
  sm,
  md,
  lg,
  xl,
  as: Component = "div",
  ...props
}: Omit<React.HTMLProps<HTMLDivElement>, "as"> & {
  sm?: number | "auto"
  md?: number | "auto"
  lg?: number | "auto"
  xl?: number | "auto"
  as?: React.ReactType
}) {
  return (
    <Component
      className={`col ${[["sm", sm], ["md", md], ["lg", lg], ["xl", xl]]
        .map(([size, value]) => (!value ? "" : `col-${size}-${value}`))
        .join(" ")} ${className ? className : ""}`}
      {...props}
    />
  )
}
