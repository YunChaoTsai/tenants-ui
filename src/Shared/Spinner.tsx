import React from "react"

import "./spinner.css"
import { Icons } from "@tourepedia/ui"

export function Spinner() {
  return (
    <span className="spin">
      <Icons.SpinnerIcon />
    </span>
  )
}

export default Spinner
