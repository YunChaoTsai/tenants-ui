import React from "react"
import { RouteComponentProps, Link, Router } from "@reach/router"
import Helmet from "react-helmet-async"

import { RedirectUnlessAuthenticated } from "./../Auth"
import ChangePassword from "./ChangePassword"
import { Grid, Col, Container } from "../Shared/Layout"

interface SettingsProps extends RouteComponentProps {}

function Settings(_: SettingsProps) {
  return (
    <RedirectUnlessAuthenticated>
      <Helmet>
        <title>Settings</title>
      </Helmet>
      <h2>Settings</h2>
      <Container fluid>
        <Grid>
          <Col as="fieldset" sm={2}>
            <ul className="list">
              <li>
                <Link to="change-password">Change Password</Link>
              </li>
            </ul>
          </Col>
          <Col className="col-sm">
            <Router>
              <ChangePassword path="change-password" />
              <ChangePassword path="/" />
            </Router>
          </Col>
        </Grid>
      </Container>
    </RedirectUnlessAuthenticated>
  )
}

export default Settings
