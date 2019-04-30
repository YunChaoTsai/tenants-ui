import React from "react"
import { RouteComponentProps, Router, Link } from "@reach/router"

import { RedirectUnlessAuthenticated } from "./../Auth"
import Item from "./Item"
import List from "./List"
import NewItem from "./New"
import EditItem from "./Edit"
import EditRoles from "./EditRoles"

export default function UsersModule(props: RouteComponentProps) {
  return (
    <RedirectUnlessAuthenticated>
      <h2>Users</h2>
      <Link to="new">New User</Link>
      <hr />
      <Router>
        <Item path=":userId" />
        <EditItem path=":userId/edit" />
        <EditRoles path=":userId/edit-roles" />
        <NewItem path="/new" />
        <List path="/" />
      </Router>
    </RedirectUnlessAuthenticated>
  )
}
