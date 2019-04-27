import React from "react"
import { RouteComponentProps, Router, Link } from "@reach/router"

import { RedirectUnlessAuthenticated } from "./../Auth"
import Item from "./Item"
import List from "./List"
import NewItem from "./New"

export default function CabsModule(props: RouteComponentProps) {
  return (
    <RedirectUnlessAuthenticated>
      <div className="display--flex justify-content--space-between">
        <h2>Cabs</h2>
        <Link to="new">New Cab</Link>
      </div>
      <hr />
      <Router>
        <NewItem path="/new" />
        <Item path=":cabId" />
        <List path="/" />
      </Router>
    </RedirectUnlessAuthenticated>
  )
}
