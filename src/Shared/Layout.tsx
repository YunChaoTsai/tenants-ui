import React from "react"
import { Omit } from "utility-types"
import classNames from "classnames"

import "./layout.css"

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

type NumberAttr = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
type ColSize = true | "auto" | NumberAttr
type ColBase = { span?: ColSize; offset?: NumberAttr; order?: NumberAttr }
type ColSpec = ColSize | ColBase

export interface ColProps {
  xs?: ColSpec
  sm?: ColSpec
  md?: ColSpec
  lg?: ColSpec
  xl?: ColSpec
}

export function Col({
  className,
  xs,
  sm,
  md,
  lg,
  xl,
  as: Component = "div",
  ...props
}: Omit<React.HTMLProps<HTMLDivElement>, "as"> &
  ColProps & {
    as?: React.ReactType
  }) {
  const prefix = "col"
  const classes: Array<string> = []
  const spans: Array<string> = []
  const deviceSize = [
    ["xs", xs],
    ["sm", sm],
    ["md", md],
    ["lg", lg],
    ["xl", xl],
  ]
  deviceSize.forEach(([breakPoint, value]) => {
    let span, offset, order
    if (value !== null && typeof value === "object") {
      span = value.span
      offset = value.offset
      order = value.order
    } else {
      span = value
    }
    let infix = breakPoint !== "xs" ? `-${breakPoint}` : ""
    if (span != null)
      spans.push(
        span === true ? `${prefix}${infix}` : `${prefix}${infix}-${span}`
      )

    if (order != null) classes.push(`order${infix}-${order}`)
    if (offset != null) classes.push(`offset${infix}-${offset}`)
  })
  if (!spans.length) {
    spans.push("col") // plain 'col'
  }
  return (
    <Component
      className={classNames(className, ...classes, ...spans)}
      {...props}
    />
  )
}
