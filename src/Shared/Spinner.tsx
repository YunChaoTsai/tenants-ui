import React from "react"

import "./spinner.css"
import { SpinnerIcon } from "./Icons"

export function Spinner() {
  return (
    <span className="spin">
      <SpinnerIcon />
    </span>
  )
}

export default Spinner
