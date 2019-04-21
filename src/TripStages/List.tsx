import React, { Fragment, useEffect } from "react"
import Helmet from "react-helmet-async"
import { connect } from "react-redux"
import { AxiosInstance } from "axios"
import { RouteComponentProps, Link } from "@reach/router"
import { Omit } from "utility-types"

import { ITripStage, actions, IStateWithKey, selectors } from "./store"
import { ThunkAction, ThunkDispatch } from "./../types"
import { withXHR, XHRProps } from "./../xhr"
import { Async, AsyncProps } from "./../Shared/Select"

export function XHR(xhr: AxiosInstance) {
  return {
    getTripStages(params?: any): Promise<ITripStage[]> {
      return xhr.get("/trip-stages").then(({ data }) => data.trip_stages)
    },
  }
}

export const getTripStages = (
  params?: any
): ThunkAction<Promise<ITripStage[]>> => (dispatch, getState, { xhr }) => {
  dispatch(actions.list.request())
  return XHR(xhr)
    .getTripStages(params)
    .then(tripStages => {
      dispatch(actions.list.success(tripStages))
      return tripStages
    })
    .catch(error => {
      dispatch(actions.list.failure(error))
      return Promise.reject(error)
    })
}

interface StateProps {
  isFetching: boolean
  tripStages: ITripStage[]
}
interface DispatchProps {
  getTripStages: (params?: any) => Promise<ITripStage[]>
}
interface OwnProps {}

export const connectWithList = connect<
  StateProps,
  DispatchProps,
  OwnProps,
  IStateWithKey
>(
  state => {
    const tripStagesSelector = selectors(state)
    return {
      isFetching: tripStagesSelector.isFetching,
      tripStages: tripStagesSelector.tripStages,
    }
  },
  (dispatch: ThunkDispatch) => ({
    getTripStages: (params?: any) => dispatch(getTripStages(params)),
  })
)

interface ListProps
  extends OwnProps,
    StateProps,
    DispatchProps,
    RouteComponentProps {}
function List({ getTripStages, tripStages, isFetching }: ListProps) {
  useEffect(() => {
    getTripStages()
  }, [])
  return (
    <Fragment>
      <Helmet>
        <title>Trip Stages</title>
      </Helmet>
      {!isFetching ? `Total: ${tripStages.length}` : ""}
      <ul>
        {isFetching
          ? "Loading..."
          : tripStages.map(tripStage => (
              <li key={tripStage.id}>
                {tripStage.name} - {tripStage.description}
                {/* <Link to={`${tripStage.id.toString()}/edit`}>Edit</Link> */}
              </li>
            ))}
      </ul>
    </Fragment>
  )
}

export default connectWithList(List)

interface SelectTripStagesProps extends XHRProps, Omit<AsyncProps, "fetch"> {}

export const SelectTripStages = withXHR<SelectTripStagesProps>(
  function SelectTripStages({ xhr, ...otherProps }: SelectTripStagesProps) {
    return (
      <Async multiple {...otherProps} fetch={q => XHR(xhr).getTripStages()} />
    )
  }
)
