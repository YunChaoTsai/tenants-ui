import React from "react"
import { RouteComponentProps, Link } from "@reach/router"

export default function NotFound(props: RouteComponentProps) {
  return (
    <div>
      <h2>Not Found</h2>
      <Link to="/">Visit Dashboard</Link>
    </div>
  )
}
