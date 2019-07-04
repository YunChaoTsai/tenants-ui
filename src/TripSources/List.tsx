import React, { Fragment, useEffect, useCallback } from "react"
import Helmet from "react-helmet-async"
import { AxiosInstance } from "axios"
import { RouteComponentProps } from "@reach/router"
import { Omit } from "utility-types"
import { Table, Paginate } from "@tourepedia/ui"

import { ITripSource, actions, IStateWithKey, selectors } from "./store"
import { ThunkAction } from "./../types"
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
    async getTripSources(
      params?: any
    ): Promise<{ data: ITripSource[]; meta: any }> {
      return xhr.get("/trip-sources", { params }).then(resp => resp.data)
    },
  }
}

export const getTripSourcesAction = (
  params?: any
): ThunkAction<Promise<ITripSource[]>> => async (dispatch, _, { xhr }) => {
  dispatch(actions.list.request())
  return XHR(xhr)
    .getTripSources(params)
    .then(tripSources => {
      dispatch(actions.list.success(tripSources))
      return tripSources.data
    })
    .catch(error => {
      dispatch(actions.list.failure(error))
      return Promise.reject(error)
    })
}

function useTripSourcesState() {
  interface StateProps extends IPaginate {
    tripSources: ITripSource[]
  }
  return useSelector<IStateWithKey, StateProps>(state => {
    const tripSourcesSelector = selectors(state)
    return {
      ...tripSourcesSelector.meta,
      isFetching: tripSourcesSelector.isFetching,
      tripSources: tripSourcesSelector.get(),
    }
  })
}

function useTripSourcesFetch() {
  const dispatch = useThunkDispatch()
  return useCallback(
    (params?: any) => {
      dispatch(getTripSourcesAction(params))
    },
    [dispatch]
  )
}

function useTripSources() {
  return {
    ...useTripSourcesState(),
    fetchTripSources: useTripSourcesFetch(),
  }
}

export default function List({  }: RouteComponentProps) {
  const {
    fetchTripSources: getTripSources,
    tripSources,
    total,
    from,
    to,
    currentPage,
    lastPage,
    isFetching,
  } = useTripSources()
  const [params, setParams] = useSearch()
  useEffect(() => {
    getTripSources({ page: currentPage })
  }, [getTripSources])
  return (
    <Fragment>
      <Helmet>
        <title>Trip Sources List</title>
      </Helmet>
      <Grid>
        <Col>
          <Search
            onSearch={params => {
              setParams(params)
              getTripSources({ ...params, page: 1 })
            }}
          />
        </Col>
        <Col className="text-right">
          <Paginate
            total={total}
            from={from}
            to={to}
            lastPage={lastPage}
            currentPage={currentPage}
            isFetching={isFetching}
            onChange={page => getTripSources({ ...params, page })}
          />
        </Col>
      </Grid>
      <Listable total={total} isFetching={isFetching}>
        <Table
          striped
          bordered
          headers={["Name", "Short Name"]}
          rows={tripSources.map(tripSource => [
            tripSource.name,
            tripSource.short_name,
          ])}
        />
      </Listable>
    </Fragment>
  )
}

interface SelectTripSourcesProps extends XHRProps, Omit<AsyncProps, "fetch"> {}

export const SelectTripSources = withXHR<SelectTripSourcesProps>(
  function SelectTripSources({ xhr, ...otherProps }: SelectTripSourcesProps) {
    return (
      <Async
        multiple
        {...otherProps}
        fetch={q =>
          XHR(xhr)
            .getTripSources({ q })
            .then(resp => resp.data)
        }
      />
    )
  }
)
