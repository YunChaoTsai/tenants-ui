import React from "react"
import { RouteComponentProps, Link, Router } from "@reach/router"

import { RedirectUnlessAuthenticated } from "./../Auth"
import List from "./List"
import NewItem from "./NewItem"
import { Grid, Col } from "../Shared/Layout"

export default function TripStagesModule(_: RouteComponentProps) {
  return (
    <RedirectUnlessAuthenticated>
      <Grid>
        <Col>
          <h2 className="white-space-pre">Hotel Payment Preferences</h2>
        </Col>
        <Col className="d-flex align-items-center justify-content-end">
          <Link to="new" className="btn btn-primary branded">
            New Hotel Payment Preference
          </Link>
        </Col>
      </Grid>
      <hr />
      <Router>
        <NewItem path="/new" />
        <List path="/" />
      </Router>
    </RedirectUnlessAuthenticated>
  )
}
