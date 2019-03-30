import React, { useEffect, useState, Fragment } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import Helmet from "react-helmet-async"
import { AxiosInstance } from "axios"
import { connect } from "react-redux"

import { ThunkAction, ThunkDispatch } from "./../types"
import { RedirectUnlessAuthenticated } from "./../Auth"
import { IRole, IPermission, actions, IStateWithKey, selectors } from "./store"
import { withXHR, XHRProps } from "./../xhr"
import { Select } from "./../Shared/Select"

export function XHR(xhr: AxiosInstance) {
  return {
    getRoles(params?: any): Promise<IRole[]> {
      return xhr.get("/roles", { params }).then(({ data }) => data.roles)
    },
    getPermissions(params?: any): Promise<IPermission[]> {
      return xhr
        .get("/permissions", { params })
        .then(({ data }) => data.permissions)
    },
  }
}

export const getRoles = (params?: any): ThunkAction<Promise<IRole[]>> => (
  dispatch,
  getState,
  { xhr }
) => {
  dispatch(actions.list.request())
  return XHR(xhr)
    .getRoles(params)
    .then(roles => {
      dispatch(actions.list.success(roles))
      return roles
    })
    .catch(error => {
      dispatch(actions.list.failure(error))
      return Promise.reject(error)
    })
}

interface StateProps {
  isFetching: boolean
  roles: IRole[]
}
interface DispatchProps {
  getRoles: (params?: any) => Promise<IRole[]>
}
interface OwnProps extends RouteComponentProps {}
interface RolesProps extends OwnProps, StateProps, DispatchProps {}
export function Roles({ getRoles, roles, isFetching }: RolesProps) {
  useEffect(() => {
    getRoles()
  }, [])
  return (
    <Fragment>
      <Helmet>
        <title>Roles</title>
      </Helmet>
      {!isFetching ? `Total: ${roles.length}` : ""}
      <ul>
        {isFetching ? (
          <li>Loading...</li>
        ) : (
          roles.map(r => (
            <li key={r.id}>
              <Link to={r.id.toString()}>{r.name}</Link>
            </li>
          ))
        )}
      </ul>
    </Fragment>
  )
}

export default connect<StateProps, DispatchProps, OwnProps, IStateWithKey>(
  state => {
    const rolesSelector = selectors(state)
    return {
      isFetching: rolesSelector.isFetching,
      roles: rolesSelector.roles,
    }
  },
  (dispatch: ThunkDispatch) => ({
    getRoles: (params?: any) => dispatch(getRoles(params)),
  })
)(Roles)

interface SelectRolesProps extends XHRProps {
  value?: IRole[]
  onChange: (roles: IRole[]) => void
  name?: string
  multiple?: boolean
}

export const SelectRoles = withXHR<SelectRolesProps>(function SelectRoles({
  onChange,
  value = [],
  multiple = false,
  name = "select[]",
  xhr,
}: SelectRolesProps) {
  const [query, setQuery] = useState<string>("")
  const [roles, setRoles] = useState<IRole[]>([])
  return (
    <Select
      value={value}
      onChange={onChange}
      name={name}
      options={roles}
      query={query}
      multiple
      onQuery={query => {
        XHR(xhr)
          .getRoles()
          .then(setRoles)
        setQuery(query)
      }}
    />
  )
})

interface SelectPermissionsProps extends XHRProps {
  value?: IPermission[]
  onChange: (permissions: IPermission[]) => void
  name?: string
  multiple?: boolean
}

export const SelectPermissions = withXHR<SelectPermissionsProps>(
  function SelectPermissions({
    onChange,
    value = [],
    multiple = false,
    name = "select[]",
    xhr,
  }: SelectPermissionsProps) {
    const [query, setQuery] = useState<string>("")
    const [permissions, setPermissions] = useState<IPermission[]>([])
    return (
      <Select
        value={value}
        onChange={onChange}
        name={name}
        options={permissions}
        query={query}
        multiple
        onQuery={query => {
          XHR(xhr)
            .getPermissions()
            .then(setPermissions)
          setQuery(query)
        }}
      />
    )
  }
)
