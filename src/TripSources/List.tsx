import React, { Fragment, useEffect } from "react"
import Helmet from "react-helmet-async"
import { connect } from "react-redux"
import { AxiosInstance } from "axios"
import { RouteComponentProps, Link } from "@reach/router"
import { Omit } from "utility-types"

import { ITripSource, actions, IStateWithKey, selectors } from "./store"
import { ThunkAction, ThunkDispatch } from "./../types"
import { withXHR, XHRProps } from "./../xhr"
import { Async, AsyncProps } from "./../Shared/Select"
import Paginate, { PaginateProps } from "../Shared/Paginate"
import Search, { useSearch } from "../Shared/Search"
import Listable from "./../Shared/List"

export function XHR(xhr: AxiosInstance) {
  return {
    getTripSources(params?: any): Promise<{ data: ITripSource[]; meta: any }> {
      return xhr.get("/trip-sources", { params }).then(resp => resp.data)
    },
  }
}

export const getTripSources = (
  params?: any
): ThunkAction<Promise<ITripSource[]>> => (dispatch, getState, { xhr }) => {
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

interface StateProps extends PaginateProps {
  tripSources: ITripSource[]
}
interface DispatchProps {
  getTripSources: (params?: any) => Promise<ITripSource[]>
}
interface OwnProps {}

export const connectWithList = connect<
  StateProps,
  DispatchProps,
  OwnProps,
  IStateWithKey
>(
  state => {
    const tripSourcesSelector = selectors(state)
    return {
      ...tripSourcesSelector.meta,
      isFetching: tripSourcesSelector.isFetching,
      tripSources: tripSourcesSelector.get(),
    }
  },
  (dispatch: ThunkDispatch) => ({
    getTripSources: (params?: any) => dispatch(getTripSources(params)),
  })
)

interface ListProps
  extends OwnProps,
    StateProps,
    DispatchProps,
    RouteComponentProps {}
function List({ getTripSources, tripSources, ...otherProps }: ListProps) {
  const { isFetching, total, currentPage } = otherProps
  const [params, setParams] = useSearch()
  useEffect(() => {
    getTripSources({ page: currentPage })
  }, [])
  return (
    <Fragment>
      <Helmet>
        <title>Trip Sources List</title>
      </Helmet>
      <div className="display--flex justify-content--space-between">
        <Search
          onSearch={params => {
            setParams(params)
            getTripSources({ ...params, page: 1 })
          }}
        />
        <Paginate
          {...otherProps}
          onChange={page => getTripSources({ ...params, page })}
        />
      </div>
      <Listable total={total} isFetching={isFetching}>
        <ul>
          {tripSources.map(tripSource => (
            <li key={tripSource.id}>
              {tripSource.name} - {tripSource.short_name}
            </li>
          ))}
        </ul>
      </Listable>
    </Fragment>
  )
}

export default connectWithList(List)

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
