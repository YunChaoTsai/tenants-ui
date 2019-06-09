import React from "react"
import { RouteComponentProps, Link } from "@reach/router"
import { Icons } from "@tourepedia/ui"

export function EmailVerified(props: RouteComponentProps) {
  return (
    <div className="pt-20">
      <div className="max-w-xl mx-auto text-center text-xl border rounded-lg py-20 px-4">
        <div>
          <div className="text-center mb-10">
            <div className="text-5xl w-20 h-20 rounded-full bg-green-400 inline-block text-white">
              <Icons.OkIcon className="align-middle" />
            </div>
          </div>
          <h1>Your Email Verified Successfully.</h1>
          <p>
            You can now{" "}
            <Link to="/" className="text-blue-600 hover:text-blue-800">
              login
            </Link>{" "}
            to the Tourepedia Admin Dashboard.
          </p>
        </div>
      </div>
    </div>
  )
}

export default EmailVerified
