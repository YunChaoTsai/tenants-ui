import React from "react"
import { Omit } from "utility-types"
import classNames from "classnames"

import "./dropdown.css"

export interface DropdownProps
  extends Omit<React.HTMLProps<HTMLElement>, "as"> {
  as?: React.ReactType
}
export default function Dropdown({
  as: Component = "div",
  className,
  ...otherProps
}: DropdownProps) {
  return (
    <Component className={classNames("drop-down", className)} {...otherProps} />
  )
}
