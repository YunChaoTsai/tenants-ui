import React from "react"
import { RouteComponentProps, Link } from "@reach/router"

export function EmailVerified(props: RouteComponentProps) {
  return (
    <div className="d-flex align-items-center justify-content-center fvh">
      <div className="text--center container--fluid">
        <div>
          <h1>Your Email Verified Successfully.</h1>
          <hr />
          <p>
            You can now <Link to="/">login</Link> to the Tourepedia Admin
            Dashboard.
          </p>
        </div>
      </div>
    </div>
  )
}

export default EmailVerified
