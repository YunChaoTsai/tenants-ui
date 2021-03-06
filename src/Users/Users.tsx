import React from "react"
import { RouteComponentProps, Router, Link } from "@reach/router"

import { RedirectUnlessAuthenticated } from "./../Auth"
import Item from "./Item"
import List from "./List"
import NewItem from "./New"
import EditItem from "./Edit"
import EditRoles from "./EditRoles"

export default function UsersModule(_: RouteComponentProps) {
  return (
    <RedirectUnlessAuthenticated>
      <Link to="new" className="btn float-right btn-primary branded">
        New User
      </Link>
      <h2>Users</h2>
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
