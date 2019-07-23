import React from "react"
import { RouteComponentProps, Router, Link } from "@reach/router"

import { RedirectUnlessAuthenticated } from "./../Auth"
import Item from "./Item"
import List from "./List"
import NewItem from "./New"

export default function TenantsModule(_: RouteComponentProps) {
  return (
    <RedirectUnlessAuthenticated>
      <Link to="new" className="btn float-right">
        Add New Agent
      </Link>
      <h2>Agents</h2>
      <hr />
      <Router>
        <NewItem path="/new" />
        <Item path=":tenantId" />
        <List path="/" />
      </Router>
    </RedirectUnlessAuthenticated>
  )
}
