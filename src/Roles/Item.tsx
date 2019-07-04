import React, { useEffect, Fragment, useCallback } from "react"
import { RouteComponentProps, Link, Redirect } from "@reach/router"
import Helmet from "react-helmet-async"
import { AxiosInstance } from "axios"
import moment from "moment"

import { ThunkAction } from "./../types"
import { IRole, actions, IStateWithKey, selectors } from "./store"
import { useSelector } from "react-redux"
import { useThunkDispatch } from "../utils"
import Spinner from "../Shared/Spinner"

function XHR(xhr: AxiosInstance) {
  return {
    async getRole(id: string): Promise<IRole> {
      return xhr.get(`/roles/${id}`).then(({ data }) => data.data)
    },
  }
}

export const getRoleAction = (
  id: string
): ThunkAction<Promise<IRole>> => async (dispatch, _, { xhr }) => {
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

export function useRoleState(roleId?: number | string) {
  interface StateProps {
    isFetching: boolean
    role?: IRole
  }
  return useSelector<IStateWithKey, StateProps>(state => {
    const rolesSelector = selectors(state)
    return {
      isFetching: rolesSelector.isFetching,
      role: rolesSelector.getItem(roleId),
    }
  })
}
export function useRoleFetch() {
  const dispatch = useThunkDispatch()
  return useCallback((roleId: string) => dispatch(getRoleAction(roleId)), [
    dispatch,
  ])
}

export function useRole(roleId?: string, shouldFetch: boolean = false) {
  const roleState = useRoleState(roleId)
  const fetchRole = useRoleFetch()
  useEffect(() => {
    if (shouldFetch) {
      roleId && fetchRole(roleId)
    }
  }, [shouldFetch, roleId])
  return {
    ...roleState,
    fetchRole,
  }
}

export default function Role({
  roleId,
  navigate,
}: RouteComponentProps<{ roleId: string }>) {
  const { role, isFetching } = useRole(roleId, true)
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
        <div className="text-center">
          <Spinner />
        </div>
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
}
