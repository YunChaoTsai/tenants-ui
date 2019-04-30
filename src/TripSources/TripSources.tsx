import React from "react"
import { RouteComponentProps, Link, Router } from "@reach/router"

import { RedirectUnlessAuthenticated } from "./../Auth"
import List from "./List"
import NewItem from "./NewItem"

export default function TripSourcesModule(props: RouteComponentProps) {
  return (
    <RedirectUnlessAuthenticated>
      <h2>Trip Sources</h2>
      <Link to="new">New Trip Source</Link>
      <hr />
      <Router>
        <NewItem path="/new" />
        <List path="/" />
      </Router>
    </RedirectUnlessAuthenticated>
  )
}
