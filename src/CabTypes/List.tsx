import React, { Fragment, useEffect, useCallback } from "react"
import Helmet from "react-helmet-async"
import { useSelector } from "react-redux"
import { AxiosInstance } from "axios"
import { RouteComponentProps } from "@reach/router"
import { Omit } from "utility-types"
import { Table, Paginate } from "@tourepedia/ui"

import { ICabType, actions, IStateWithKey, selectors } from "./store"
import { ThunkAction } from "./../types"
import { withXHR, XHRProps } from "./../xhr"
import { Async, AsyncProps } from "@tourepedia/select"
import Search, { useSearch } from "../Shared/Search"
import Listable from "./../Shared/List"
import { Grid, Col } from "../Shared/Layout"
import { IPaginate } from "./../model"
import { useThunkDispatch } from "../utils"

export function XHR(xhr: AxiosInstance) {
  return {
    async getCabTypes(params?: any): Promise<{ data: ICabType[]; meta: any }> {
      return xhr.get("/cab-types", { params }).then(({ data }) => data)
    },
  }
}

export const getCabTypesAction = (
  params?: any
): ThunkAction<Promise<ICabType[]>> => async (dispatch, _, { xhr }) => {
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

function useCabTypesState() {
  interface State extends IPaginate {
    cabTypes: ICabType[]
    isFetching: boolean
  }
  return useSelector<IStateWithKey, State>(state => {
    const cabTypesSelector = selectors(state)
    return {
      ...cabTypesSelector.meta,
      isFetching: cabTypesSelector.isFetching,
      cabTypes: cabTypesSelector.get(),
    }
  })
}

function useCabTypesFetch() {
  const dispatch = useThunkDispatch()
  return useCallback((params?: any) => dispatch(getCabTypesAction(params)), [
    dispatch,
  ])
}

export function useCabTypes() {
  return {
    ...useCabTypesState(),
    fetchCabTypes: useCabTypesFetch(),
  }
}

export default function List(_: RouteComponentProps) {
  const {
    cabTypes,
    isFetching,
    total,
    currentPage,
    lastPage,
    from,
    to,
    fetchCabTypes: getCabTypes,
  } = useCabTypes()
  const [params, setParams] = useSearch()
  useEffect(() => {
    getCabTypes({ page: currentPage })
  }, [getCabTypes])
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
