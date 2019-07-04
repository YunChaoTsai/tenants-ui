import React, { useEffect, Fragment, useCallback } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import Helmet from "react-helmet-async"
import { AxiosInstance } from "axios"
import { Omit } from "utility-types"
import { Table, Paginate } from "@tourepedia/ui"

import { ThunkAction } from "./../types"
import { IRole, IPermission, actions, IStateWithKey, selectors } from "./store"
import { withXHR, XHRProps } from "./../xhr"
import { Async, AsyncProps } from "@tourepedia/select"
import Search, { useSearch } from "../Shared/Search"
import Listable from "./../Shared/List"
import { Grid, Col } from "../Shared/Layout"
import { IPaginate } from "../model"
import { useSelector } from "react-redux"
import { useThunkDispatch } from "../utils"

export function XHR(xhr: AxiosInstance) {
  return {
    async getRoles(params?: any): Promise<{ data: IRole[]; meta: any }> {
      return xhr.get("/roles", { params }).then(resp => resp.data)
    },
    async getPermissions(params?: any): Promise<IPermission[]> {
      return xhr.get("/permissions", { params }).then(({ data }) => data.data)
    },
  }
}

export const getRolesAction = (
  params?: any
): ThunkAction<Promise<IRole[]>> => async (dispatch, _, { xhr }) => {
  dispatch(actions.list.request())
  return XHR(xhr)
    .getRoles(params)
    .then(roles => {
      dispatch(actions.list.success(roles))
      return roles.data
    })
    .catch(error => {
      dispatch(actions.list.failure(error))
      return Promise.reject(error)
    })
}

function useRolesState() {
  interface StateProps extends IPaginate {
    roles: IRole[]
    isFetching: boolean
  }
  return useSelector<IStateWithKey, StateProps>(state => {
    const rolesSelector = selectors(state)
    return {
      ...rolesSelector.meta,
      isFetching: rolesSelector.isFetching,
      roles: rolesSelector.get(),
    }
  })
}
function useRolesFetch() {
  const dispatch = useThunkDispatch()
  return useCallback((params?: any) => dispatch(getRolesAction(params)), [
    dispatch,
  ])
}
function useRoles() {
  return {
    ...useRolesState(),
    fetchRoles: useRolesFetch(),
  }
}
export default function Roles({  }: RouteComponentProps) {
  const {
    roles,
    total,
    from,
    to,
    isFetching,
    currentPage,
    lastPage,
    fetchRoles: getRoles,
  } = useRoles()
  const [params, setParams] = useSearch()
  useEffect(() => {
    getRoles({ page: currentPage })
  }, [getRoles])
  return (
    <Fragment>
      <Helmet>
        <title>Roles</title>
      </Helmet>
      <Grid>
        <Col>
          <Search
            onSearch={params => {
              setParams(params)
              getRoles({ ...params, page: 1 })
            }}
          />
        </Col>
        <Col className="text-right">
          <Paginate
            total={total}
            from={from}
            to={to}
            currentPage={currentPage}
            lastPage={lastPage}
            isFetching={isFetching}
            onChange={page => getRoles({ ...params, page })}
          />
        </Col>
      </Grid>
      <Listable total={total} isFetching={isFetching}>
        <Table
          headers={["Name", "Permissions"]}
          striped
          bordered
          rows={roles.map(r => [
            <Link to={r.id.toString()}>{r.name}</Link>,
            (r.permissions || []).map(p => p.name).join(" • "),
          ])}
        />
      </Listable>
    </Fragment>
  )
}

interface SelectRolesProps extends XHRProps, Omit<AsyncProps, "fetch"> {}

export const SelectRoles = withXHR<SelectRolesProps>(function SelectRoles({
  xhr,
  ...otherProps
}: SelectRolesProps) {
  return (
    <Async
      multiple
      fetch={q =>
        XHR(xhr)
          .getRoles({ q })
          .then(resp => resp.data)
      }
      {...otherProps}
    />
  )
})

interface SelectPermissionsProps extends XHRProps, Omit<AsyncProps, "fetch"> {}

export const SelectPermissions = withXHR<SelectPermissionsProps>(
  function SelectPermissions({ xhr, ...otherProps }: SelectPermissionsProps) {
    return (
      <Async
        multiple
        fetch={q => XHR(xhr).getPermissions({ q })}
        {...otherProps}
      />
    )
  }
)
