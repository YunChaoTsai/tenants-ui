import React from "react"
import { RouteComponentProps, Link, Router } from "@reach/router"

import { RedirectUnlessAuthenticated } from "./../Auth"
import List from "./List"
import Item from "./Item"
import NewItem from "./NewItem"

export default function Trips(props: RouteComponentProps) {
  return (
    <RedirectUnlessAuthenticated>
      <h3>Trips</h3>
      <Link to="new">New Trip</Link>
      <hr />
      <Router>
        <List path="/" />
        <NewItem path="/new" />
        <Item path=":tripId/*" />
      </Router>
    </RedirectUnlessAuthenticated>
  )
}
