import React, { useEffect, Fragment } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import Helmet from "react-helmet-async"
import { AxiosInstance } from "axios"
import { connect } from "react-redux"
import { Omit } from "utility-types"
import { Table, Paginate } from "@tourepedia/ui"

import { ThunkAction, ThunkDispatch } from "./../types"
import { IRole, IPermission, actions, IStateWithKey, selectors } from "./store"
import { withXHR, XHRProps } from "./../xhr"
import { Async, AsyncProps } from "@tourepedia/select"
import Search, { useSearch } from "../Shared/Search"
import Listable from "./../Shared/List"
import { Grid, Col } from "../Shared/Layout"
import { IPaginate } from "../model"

export function XHR(xhr: AxiosInstance) {
  return {
    getRoles(params?: any): Promise<{ data: IRole[]; meta: any }> {
      return xhr.get("/roles", { params }).then(resp => resp.data)
    },
    getPermissions(params?: any): Promise<IPermission[]> {
      return xhr.get("/permissions", { params }).then(({ data }) => data.data)
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
      return roles.data
    })
    .catch(error => {
      dispatch(actions.list.failure(error))
      return Promise.reject(error)
    })
}

interface StateProps extends IPaginate {
  roles: IRole[]
  isFetching: boolean
}
interface DispatchProps {
  getRoles: (params?: any) => Promise<IRole[]>
}
interface OwnProps extends RouteComponentProps {}
interface RolesProps extends OwnProps, StateProps, DispatchProps {}
export function Roles({
  getRoles,
  roles,
  total,
  from,
  to,
  isFetching,
  currentPage,
  lastPage,
}: RolesProps) {
  const [params, setParams] = useSearch()
  useEffect(() => {
    getRoles({ page: currentPage })
  }, [])
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

export default connect<StateProps, DispatchProps, OwnProps, IStateWithKey>(
  state => {
    const rolesSelector = selectors(state)
    return {
      ...rolesSelector.meta,
      isFetching: rolesSelector.isFetching,
      roles: rolesSelector.get(),
    }
  },
  (dispatch: ThunkDispatch) => ({
    getRoles: (params?: any) => dispatch(getRoles(params)),
  })
)(Roles)

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
