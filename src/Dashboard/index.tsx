import React, { useState, useEffect } from "react"
import { RouteComponentProps, navigate } from "@reach/router"
import Button from "@tourepedia/button"
import Helmet from "react-helmet-async"

import { RedirectUnlessAuthenticated } from "./../Auth"
import { withXHR, XHRProps } from "./../xhr"
import { listXHR as userListXHR } from "./../Users"
import { listXHR as roleListXHR } from "./../Roles"

interface DashboardProps extends RouteComponentProps, XHRProps {}

function Dashboard({ xhr }: DashboardProps) {
  const [userCount, setUserCount] = useState<number | undefined>(undefined)
  const [roleCount, setRoleCount] = useState<number | undefined>(undefined)
  useEffect(() => {
    userListXHR(xhr)
      .getUsers({ limit: 0, offset: 0 })
      .then(users => setUserCount(users.length))
  }, [])
  useEffect(() => {
    roleListXHR(xhr)
      .getRoles({ limit: 0, offset: 0 })
      .then(roles => setRoleCount(roles.length))
  }, [])
  return (
    <RedirectUnlessAuthenticated>
      <Helmet>
        <title>Dashboard</title>
      </Helmet>
      <div>Dashboard</div>
      Users: {userCount === undefined ? "Loading..." : userCount}
      <br />
      Roles: {roleCount === undefined ? "Loading..." : roleCount}
    </RedirectUnlessAuthenticated>
  )
}

export default withXHR<DashboardProps>(Dashboard)
