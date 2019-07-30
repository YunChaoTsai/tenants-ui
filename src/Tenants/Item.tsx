import React, { useEffect, Fragment, useCallback } from "react"
import { RouteComponentProps, Link, Redirect } from "@reach/router"
import Helmet from "react-helmet-async"
import { AxiosInstance } from "axios"
import { useSelector } from "react-redux"
import moment from "moment"

import { ThunkAction } from "./../types"
import { ITenant, actions, IStateWithKey, selectors } from "./store"
import { useThunkDispatch } from "../utils"

function XHR(xhr: AxiosInstance) {
  return {
    async getTenant(id: string): Promise<ITenant> {
      return xhr.get(`/tenants/${id}`).then(({ data }) => data.data)
    },
  }
}

export const getTenantAction = (
  id: string
): ThunkAction<Promise<ITenant>> => async (dispatch, _, { xhr }) => {
  dispatch(actions.item.request())
  return XHR(xhr)
    .getTenant(id)
    .then(tenant => {
      dispatch(actions.item.success(tenant))
      return tenant
    })
    .catch(error => {
      dispatch(actions.item.failure(error))
      return Promise.reject(error)
    })
}

export function useTenantState(tenantId?: number | string) {
  interface StateProps {
    isFetching: boolean
    tenant?: ITenant
  }
  return useSelector<IStateWithKey, StateProps>(state => {
    const tenantsSelector = selectors(state)
    return {
      isFetching: tenantsSelector.isFetching,
      tenant: tenantsSelector.getItem(tenantId),
    }
  })
}

export function useTenantFetch() {
  const dispatch = useThunkDispatch()
  return useCallback(
    (tenantId: string) => dispatch(getTenantAction(tenantId)),
    [dispatch]
  )
}

export function useTenant(tenantId?: string, shouldFetch: boolean = false) {
  const state = useTenantState(tenantId)
  const fetchTenant = useTenantFetch()
  useEffect(() => {
    if (shouldFetch) {
      tenantId && fetchTenant(tenantId)
    }
  }, [tenantId, shouldFetch, fetchTenant])
  return {
    ...state,
    fetchTenant,
  }
}

export default function Tenant({
  tenantId,
  navigate,
}: RouteComponentProps<{ tenantId: string }>) {
  const { tenant, isFetching } = useTenant(tenantId, true)
  if (!tenantId) {
    navigate && navigate("/tenants")
    return null
  }
  return (
    <Fragment>
      <Helmet>
        <title>{tenant ? tenant.name : ""}</title>
      </Helmet>
      <Link to="..">Back to list</Link>
      {isFetching ? (
        "Loading..."
      ) : tenant ? (
        <div>
          <h3>{tenant.name}</h3>
          <p>{tenant.description}</p>
          <div className="float-right">
            {tenant.invited_at ? (
              <b>
                Invited at:{" "}
                {moment
                  .utc(tenant.invited_at)
                  .local()
                  .toLocaleString()}
              </b>
            ) : (
              "Not invited yet"
            )}
            <br />
            {tenant.signup_at ? (
              <b>
                Signedup at:{" "}
                {moment
                  .utc(tenant.signup_at)
                  .local()
                  .toLocaleString()}
              </b>
            ) : (
              "Not invited yet"
            )}
          </div>
          <h4>Users</h4>
          <ul>
            {tenant.users
              ? tenant.users.map(user => (
                  <li key={user.id}>
                    <Link to={`/users/${user.id}`}>{user.name}</Link> -{" "}
                    {user.email} - {user.email_verified_at}
                  </li>
                ))
              : null}
          </ul>
        </div>
      ) : (
        <Redirect noThrow to="/tenants" />
      )}
    </Fragment>
  )
}
