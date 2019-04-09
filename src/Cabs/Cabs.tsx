import React from "react"
import { RouteComponentProps, Router, Link } from "@reach/router"

import { RedirectUnlessAuthenticated } from "./../Auth"
import Item from "./Item"
import List from "./List"
import NewItem from "./New"

export default function CabsModule(props: RouteComponentProps) {
  return (
    <RedirectUnlessAuthenticated>
      <h2>Cabs</h2>
      <Link to="new">New Cab</Link>
      <Router>
        <NewItem path="/new" />
        <Item path=":cabId" />
        <List path="/" />
      </Router>
    </RedirectUnlessAuthenticated>
  )
}
