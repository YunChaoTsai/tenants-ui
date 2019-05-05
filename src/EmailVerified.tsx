import React from "react"
import { RouteComponentProps, Link } from "@reach/router"

export function EmailVerified(props: RouteComponentProps) {
  return (
    <div className="d-flex align-items-center justify-content-center fvh">
      <fieldset className="text--center container--fluid">
        <legend>Tourepedia Admin Dashboard</legend>
        <div>
          <h1>Email Verified Successfully.</h1>
          <p>
            You can now <Link to="/">login</Link> to the Dashboard.
          </p>
        </div>
      </fieldset>
    </div>
  )
}

export default EmailVerified
