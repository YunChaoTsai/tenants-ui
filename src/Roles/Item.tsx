import React, { useEffect, Fragment } from "react"
import { RouteComponentProps, Link, Redirect } from "@reach/router"
import Helmet from "react-helmet-async"
import { AxiosInstance } from "axios"
import { connect } from "react-redux"
import moment from "moment"

import { ThunkAction, ThunkDispatch } from "./../types"
import { IRole, actions, IStateWithKey, selectors } from "./store"

function XHR(xhr: AxiosInstance) {
  return {
    getRole(id: string): Promise<IRole> {
      return xhr.get(`/roles/${id}`).then(({ data }) => data.data)
    },
  }
}

export const getRole = (id: string): ThunkAction<Promise<IRole>> => (
  dispatch,
  getState,
  { xhr }
) => {
  dispatch(actions.item.request())
  return XHR(xhr)
    .getRole(id)
    .then(role => {
      dispatch(actions.item.success(role))
      return role
    })
    .catch(error => {
      dispatch(actions.item.failure(error))
      return Promise.reject(error)
    })
}

interface StateProps {
  isFetching: boolean
  role?: IRole
}
interface DispatchProps {
  getRole: (id: string) => Promise<IRole>
}
interface OwnProps {
  roleId?: string
  render: (props: StateProps & { roleId?: string }) => React.ReactNode
}
interface RolesProps extends OwnProps, StateProps, DispatchProps {}

export const withRoleData = connect<
  StateProps,
  DispatchProps,
  OwnProps,
  IStateWithKey
>(
  (state, ownProps) => {
    const rolesSelector = selectors(state)
    return {
      isFetching: rolesSelector.isFetching,
      role: rolesSelector.getItem(ownProps.roleId),
    }
  },
  (dispatch: ThunkDispatch) => ({
    getRole: (id: string) => dispatch(getRole(id)),
  })
)

export const RoleDataProvider = withRoleData(function RoleDataProvider({
  getRole,
  role,
  isFetching,
  roleId,
  render,
}: RolesProps) {
  useEffect(() => {
    if (roleId) getRole(roleId)
  }, [])
  return (
    <Fragment>
      {render({
        role,
        isFetching,
        roleId,
      })}
    </Fragment>
  )
})

export default function Role({
  roleId,
  navigate,
}: RouteComponentProps<{ roleId: string }>) {
  return (
    <RoleDataProvider
      roleId={roleId}
      render={({ role, isFetching }) => {
        if (!roleId) {
          navigate && navigate("/roles")
          return null
        }
        return (
          <Fragment>
            <Helmet>
              <title>{role ? role.name : ""} Role</title>
            </Helmet>
            <Link to="..">Back to list</Link>
            {isFetching ? (
              "Loading..."
            ) : role ? (
              <div>
                <h3>
                  {role.name}{" "}
                  <Link to="edit" title="Edit Role">
                    &#9998;
                  </Link>
                </h3>
                Created at:{" "}
                {moment
                  .utc(role.created_at)
                  .local()
                  .format("Do MMM YYYY \\at hh:mm A")}
                <br />
                <p>
                  <b>Permissions</b>:{" "}
                  {(role.permissions || []).map((p, i, arr) => (
                    <span key={p.id}>
                      {p.name}
                      {i !== arr.length - 1 ? " • " : ""}
                    </span>
                  ))}{" "}
                  <Link to="edit-permissions" title="Edit Permissions">
                    &#9998;
                  </Link>
                </p>
              </div>
            ) : (
              <Redirect noThrow to="/users" />
            )}
          </Fragment>
        )
      }}
    />
  )
}
