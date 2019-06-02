import React from "react"
import { RouteComponentProps, Link, Router } from "@reach/router"

import { RedirectUnlessAuthenticated } from "./../Auth"
import List from "./List"
import Item from "./Item"
import NewItem from "./NewItem"

export default function Trips(props: RouteComponentProps) {
  return (
    <RedirectUnlessAuthenticated>
      <Link to="new" className="float-right btn">
        Add New Trip
      </Link>
      <h2>Trips</h2>
      <hr />
      <Router>
        <List path="/" />
        <NewItem path="/new" />
        <Item path=":tripId/*" />
      </Router>
    </RedirectUnlessAuthenticated>
  )
}
