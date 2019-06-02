import React from "react"
import { RouteComponentProps, Link, Router } from "@reach/router"

import { RedirectUnlessAuthenticated } from "./../Auth"
import List from "./List"
import NewItem from "./NewItem"

export default function TripStagesModule(props: RouteComponentProps) {
  return (
    <RedirectUnlessAuthenticated>
      <Link to="new" className="float-right btn">
        New Trip Stage
      </Link>
      <h2>Trip Stages</h2>
      <hr />
      <Router>
        <NewItem path="/new" />
        <List path="/" />
      </Router>
    </RedirectUnlessAuthenticated>
  )
}
