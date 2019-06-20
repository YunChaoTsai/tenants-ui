import React from "react"
import { Omit } from "utility-types"
import classNames from "classnames"

import "./dropdown.css"

export interface DropdownProps
  extends Omit<React.HTMLProps<HTMLElement>, "as"> {
  as?: React.ReactType
  alignRight?: boolean
}
export default function Dropdown({
  as: Component = "div",
  className,
  alignRight = false,
  ...otherProps
}: DropdownProps) {
  return (
    <Component
      className={classNames(
        "drop-down",
        {
          "align-right": alignRight,
        },
        className
      )}
      {...otherProps}
    />
  )
}
