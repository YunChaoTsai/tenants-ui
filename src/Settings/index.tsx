import React from "react"
import { RouteComponentProps, Link, Router } from "@reach/router"
import Helmet from "react-helmet-async"

import { RedirectUnlessAuthenticated, connectWithAuth } from "./../Auth"
import { AuthProps } from "./../Auth/User"
import ChangePassword from "./ChangePassword"

interface SettingsProps extends AuthProps, RouteComponentProps {}
function Settings({ user }: SettingsProps) {
  return (
    <RedirectUnlessAuthenticated>
      <Helmet>
        <title>Settings</title>
      </Helmet>
      <h2>Settings</h2>
      <div className="row">
        <fieldset className="col-sm-2">
          <ul className="list">
            <li>
              <Link to="change-password">Change Password</Link>
            </li>
          </ul>
        </fieldset>
        <div className="col-sm">
          <Router>
            <ChangePassword path="change-password" />
            <ChangePassword path="/" />
          </Router>
        </div>
      </div>
    </RedirectUnlessAuthenticated>
  )
}

export default connectWithAuth(Settings)
