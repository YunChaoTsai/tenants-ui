import React, { Fragment, useEffect } from "react"
import Helmet from "react-helmet-async"
import { connect } from "react-redux"
import { AxiosInstance } from "axios"
import { RouteComponentProps } from "@reach/router"
import { Omit } from "utility-types"
import { Table, Paginate } from "@tourepedia/ui"

import { ICabType, actions, IStateWithKey, selectors } from "./store"
import { ThunkAction, ThunkDispatch } from "./../types"
import { withXHR, XHRProps } from "./../xhr"
import { Async, AsyncProps } from "@tourepedia/select"
import Search, { useSearch } from "../Shared/Search"
import Listable from "./../Shared/List"
import { Grid, Col } from "../Shared/Layout"
import { IPaginate } from "./../model"

export function XHR(xhr: AxiosInstance) {
  return {
    getCabTypes(params?: any): Promise<{ data: ICabType[]; meta: any }> {
      return xhr.get("/cab-types", { params }).then(({ data }) => data)
    },
  }
}

export const getCabTypes = (params?: any): ThunkAction<Promise<ICabType[]>> => (
  dispatch,
  getState,
  { xhr }
) => {
  dispatch(actions.list.request())
  return XHR(xhr)
    .getCabTypes(params)
    .then(({ data, meta }) => {
      dispatch(actions.list.success({ data, meta }))
      return data
    })
    .catch(error => {
      dispatch(actions.list.failure(error))
      return Promise.reject(error)
    })
}

interface StateProps extends IPaginate {
  cabTypes: ICabType[]
  isFetching: boolean
}
interface DispatchProps {
  getCabTypes: (params?: any) => Promise<ICabType[]>
}
interface OwnProps {}

export const connectWithList = connect<
  StateProps,
  DispatchProps,
  OwnProps,
  IStateWithKey
>(
  state => {
    const cabTypesSelector = selectors(state)
    return {
      ...cabTypesSelector.meta,
      isFetching: cabTypesSelector.isFetching,
      cabTypes: cabTypesSelector.get(),
    }
  },
  (dispatch: ThunkDispatch) => ({
    getCabTypes: (params?: any) => dispatch(getCabTypes(params)),
  })
)

interface ListProps
  extends OwnProps,
    StateProps,
    DispatchProps,
    RouteComponentProps {}
function List({
  getCabTypes,
  cabTypes,
  isFetching,
  total,
  currentPage,
  lastPage,
  from,
  to,
}: ListProps) {
  const [params, setParams] = useSearch()
  useEffect(() => {
    getCabTypes({ page: currentPage })
  }, [])
  return (
    <Fragment>
      <Helmet>
        <title>Cab Types</title>
      </Helmet>
      <Grid>
        <Col>
          <Search
            onSearch={params => {
              setParams(params)
              getCabTypes({ ...params, page: 1 })
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
            onChange={page => getCabTypes({ ...params, page })}
          />
        </Col>
      </Grid>
      <Listable isFetching={isFetching} total={total}>
        <Table
          headers={["Name", "Capacity"]}
          alignCols={{ 1: "right" }}
          bordered
          striped
          rows={cabTypes.map(cabType => [cabType.name, cabType.capacity])}
        />
      </Listable>
    </Fragment>
  )
}

export default connectWithList(List)

interface SelectCabTypeProps extends XHRProps, Omit<AsyncProps, "fetch"> {}

export const SelectCabTypes = withXHR<SelectCabTypeProps>(
  function SelectCabTypes({ xhr, ...otherProps }: SelectCabTypeProps) {
    return (
      <Async
        multiple
        {...otherProps}
        fetch={q =>
          XHR(xhr)
            .getCabTypes({ q })
            .then(resp => resp.data)
        }
      />
    )
  }
)
