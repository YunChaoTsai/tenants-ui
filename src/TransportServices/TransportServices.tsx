import React from "react"
import { RouteComponentProps, Link, Router } from "@reach/router"

import { RedirectUnlessAuthenticated } from "./../Auth"
import List from "./List"
import NewItem from "./NewItem"
import NavLink from "../Shared/NavLink"

export default function TransportServicesModule(props: RouteComponentProps) {
  return (
    <RedirectUnlessAuthenticated>
      <h2>Transport Services</h2>
      <ul className="list--inline">
        <NavLink to="new">New Transport Service</NavLink>
      </ul>
      <hr />
      <Router>
        <NewItem path="/new" />
        <List path="/" />
      </Router>
    </RedirectUnlessAuthenticated>
  )
}
