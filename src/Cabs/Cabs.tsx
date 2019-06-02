import React from "react"
import { RouteComponentProps, Router, Link } from "@reach/router"

import { RedirectUnlessAuthenticated } from "./../Auth"
import Item from "./Item"
import List from "./List"
import NewItem from "./New"

export default function CabsModule(props: RouteComponentProps) {
  return (
    <RedirectUnlessAuthenticated>
      <Link to="new" className="btn btn-primary float-right">
        Add New Cab
      </Link>
      <h2>Cabs</h2>
      <hr />
      <Router>
        <NewItem path="/new" />
        <Item path=":cabId" />
        <List path="/" />
      </Router>
    </RedirectUnlessAuthenticated>
  )
}
