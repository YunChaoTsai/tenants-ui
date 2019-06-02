import React from "react"
import { RouteComponentProps, Link, Router } from "@reach/router"

import { RedirectUnlessAuthenticated } from "./../Auth"
import List from "./List"
import NewItem from "./NewItem"

export default function RoomTypesModule(props: RouteComponentProps) {
  return (
    <RedirectUnlessAuthenticated>
      <Link to="new" className="btn float-right">
        New Room Type
      </Link>
      <h2>Room Types</h2>
      <hr />
      <Router>
        <NewItem path="/new" />
        <List path="/" />
      </Router>
    </RedirectUnlessAuthenticated>
  )
}
