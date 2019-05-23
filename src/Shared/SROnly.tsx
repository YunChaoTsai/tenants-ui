import React from "react"

import "./sr-only.css"
/**
 * The children are only visible to screen readers
 */
export default function SROnly({
  children = null,
}: {
  children?: React.ReactNode
}) {
  return <span className="sr-only">{children}</span>
}
