import React, { useEffect, Fragment, useCallback } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import Helmet from "react-helmet-async"
import { AxiosInstance } from "axios"
import { useSelector, useDispatch } from "react-redux"
import { Omit } from "utility-types"

import { ThunkAction, ThunkDispatch } from "./../types"
import { ITenant, actions, IStateWithKey, selectors } from "./store"
import { withXHR, XHRProps } from "./../xhr"
import { Async, AsyncProps } from "@tourepedia/select"
import { Search, useSearch } from "./../Shared/Search"
import { List } from "./../Shared/List"
import { Grid, Col } from "../Shared/Layout"
import { Table, Paginate } from "@tourepedia/ui"
import { IPaginate } from "./../model"

export function XHR(xhr: AxiosInstance) {
  return {
    async getTenants(params?: any): Promise<{ data: ITenant[]; meta: any }> {
      return xhr.get("/tenants", { params }).then(resp => resp.data)
    },
  }
}

export const getTenantsAction = (
  params?: any
): ThunkAction<Promise<ITenant[]>> => async (dispatch, _, { xhr }) => {
  dispatch(actions.list.request())
  return XHR(xhr)
    .getTenants(params)
    .then(({ data, meta }) => {
      dispatch(actions.list.success({ data, meta }))
      return data
    })
    .catch(error => {
      dispatch(actions.list.failure(error))
      return Promise.reject(error)
    })
}

function useTenantsState() {
  interface StateProps extends IPaginate {
    tenants: ITenant[]
    isFetching: boolean
  }
  return useSelector<IStateWithKey, StateProps>(state => {
    const tenantsSelector = selectors(state)
    return {
      ...tenantsSelector.meta,
      isFetching: tenantsSelector.isFetching,
      tenants: tenantsSelector.get(),
    }
  })
}

function useTenantsFetch() {
  const dispatch = useDispatch<ThunkDispatch>()
  return useCallback((params?: any) => dispatch(getTenantsAction(params)), [
    dispatch,
  ])
}

export function useTenants() {
  return {
    ...useTenantsState(),
    fetchTenants: useTenantsFetch(),
  }
}

export default function Tenants(_: RouteComponentProps) {
  const {
    tenants,
    total,
    from,
    to,
    currentPage,
    lastPage,
    isFetching,
    fetchTenants: getTenants,
  } = useTenants()
  const [params, setParams] = useSearch()
  useEffect(() => {
    getTenants({ page: currentPage })
  }, [getTenants])
  return (
    <Fragment>
      <Helmet>
        <title>Agents</title>
      </Helmet>
      <Grid>
        <Col>
          <Search
            onSearch={params => {
              setParams(params)
              getTenants({ ...params, page: 1 })
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
            onChange={page => getTenants({ ...params, page })}
          />
        </Col>
      </Grid>
      <List isFetching={isFetching} total={total}>
        <Table
          headers={["Name", "Description"]}
          striped
          bordered
          rows={tenants.map(r => [
            <Link to={r.id.toString()}>{r.name}</Link>,
            r.description,
          ])}
        />
      </List>
    </Fragment>
  )
}

interface SelectTenantsProps extends XHRProps, Omit<AsyncProps, "fetch"> {
  value?: ITenant[]
  onChange: (tenants: ITenant[]) => void
}

export const SelectTenants = withXHR<SelectTenantsProps>(
  function SelectTenants({ xhr, ...otherProps }: SelectTenantsProps) {
    return (
      <Async
        multiple
        fetch={q =>
          XHR(xhr)
            .getTenants({ q })
            .then(resp => resp.data)
        }
        {...otherProps}
      />
    )
  }
)
