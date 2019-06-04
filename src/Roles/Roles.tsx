import React from "react"
import { RouteComponentProps, Router, Link } from "@reach/router"

import { RedirectUnlessAuthenticated } from "./../Auth"
import Item from "./Item"
import List from "./List"
import NewItem from "./New"
import Edit from "./Edit"
import EditPermissions from "./EditPermissions"

export default function RolesModule(props: RouteComponentProps) {
  return (
    <RedirectUnlessAuthenticated>
      <Link to="new" className="btn float-right">
        New Role
      </Link>
      <h2>Roles</h2>
      <hr />
      <Router>
        <Item path=":roleId" />
        <Edit path=":roleId/edit" />
        <EditPermissions path=":roleId/edit-permissions" />
        <NewItem path="/new" />
        <List path="/" />
      </Router>
    </RedirectUnlessAuthenticated>
  )
}
