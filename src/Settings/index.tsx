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
      <ul>
        <li>
          <Link to="change-password">Change Password</Link>
        </li>
      </ul>
      <Router>
        <ChangePassword path="change-password" />
      </Router>
    </RedirectUnlessAuthenticated>
  )
}

export default connectWithAuth(Settings)
