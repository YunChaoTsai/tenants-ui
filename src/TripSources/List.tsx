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

export function XHR(xhr: AxiosInstance) {
  return {
    getTripSources(params?: any): Promise<ITripSource[]> {
      return xhr
        .get("/trip-sources", { params })
        .then(({ data }) => data.trip_sources)
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
      return tripSources
    })
    .catch(error => {
      dispatch(actions.list.failure(error))
      return Promise.reject(error)
    })
}

interface StateProps {
  isFetching: boolean
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
      isFetching: tripSourcesSelector.isFetching,
      tripSources: tripSourcesSelector.tripSources,
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
function List({ getTripSources, tripSources, isFetching }: ListProps) {
  useEffect(() => {
    getTripSources()
  }, [])
  return (
    <Fragment>
      <Helmet>
        <title>Trip Sources</title>
      </Helmet>
      {!isFetching ? `Total: ${tripSources.length}` : ""}
      <ul>
        {isFetching
          ? "Loading..."
          : tripSources.map(tripSource => (
              <li key={tripSource.id}>
                {tripSource.name} - {tripSource.short_name}
                {/* <Link to={`${tripSource.id.toString()}/edit`}>Edit</Link> */}
              </li>
            ))}
      </ul>
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
        fetch={q => XHR(xhr).getTripSources({ q })}
      />
    )
  }
)
