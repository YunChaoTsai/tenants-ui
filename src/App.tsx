import React, { Fragment } from "react"
import { Router, Link } from "@reach/router"
import Helmet from "react-helmet-async"

import { Login, Logout } from "./Auth"
import Dashboard from "./Dashboard"
import NotFound from "./NotFound"
import Header from "./Header"
import Settings from "./Settings"
import ForgotPassword from "./ForgotPassword"
import ResetPassword from "./ResetPassword"
import { Users } from "./Users"
import { Roles } from "./Roles"

export default function App() {
  return (
    <Fragment>
      <Helmet titleTemplate="%s | Tourepedia" defaultTitle="Tourepedia" />
      <Header />
      <Router>
        <Login path="/login" />
        <ForgotPassword path="/forgot-password" />
        <ResetPassword path="/reset-password" />
        <Dashboard path="/" />
        <Logout path="/logout" />
        <Settings path="/settings/*" />
        <Users path="/users/*" />
        <Roles path="/roles/*" />
        <NotFound default />
      </Router>
    </Fragment>
  )
}
