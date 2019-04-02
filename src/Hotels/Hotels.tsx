import React from "react"
import { RouteComponentProps, Link, Router } from "@reach/router"

import { RedirectUnlessAuthenticated } from "./../Auth"
import List from "./List"
import Item from "./Item"
import NewItem from "./NewItem"

export default function HotelsModule(props: RouteComponentProps) {
  return (
    <RedirectUnlessAuthenticated>
      <h2>Hotels</h2>
      <Link to="new">New Hotel</Link>
      <Router>
        <NewItem path="new" />
        <Item path=":hotelId" />
        <List path="/" />
      </Router>
    </RedirectUnlessAuthenticated>
  )
}
