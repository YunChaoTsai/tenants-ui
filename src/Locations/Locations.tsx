import React from "react"
import { RouteComponentProps, Link, Router } from "@reach/router"

import { RedirectUnlessAuthenticated } from "./../Auth"
import List from "./List"
import NewItem from "./NewItem"

export default function LocationsModule(_: RouteComponentProps) {
  return (
    <RedirectUnlessAuthenticated>
      <Link to="new" className="float-right btn branded btn-primary">
        New Location
      </Link>
      <h2>Locations</h2>
      <hr />
      <Router>
        <NewItem path="/new" />
        <List path="/" />
      </Router>
    </RedirectUnlessAuthenticated>
  )
}
