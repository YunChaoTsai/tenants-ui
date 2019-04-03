import React, { Fragment, useEffect } from "react"
import Helmet from "react-helmet-async"
import { connect } from "react-redux"
import { AxiosInstance } from "axios"
import { RouteComponentProps, Link } from "@reach/router"
import { Omit } from "utility-types"

import { ILocation, actions, IStateWithKey, selectors } from "./store"
import { ThunkAction, ThunkDispatch } from "./../types"
import { Async, AsyncProps } from "./../Shared/Select"
import { withXHR, XHRProps } from "./../xhr"

export function XHR(xhr: AxiosInstance) {
  return {
    getLocations(params?: any): Promise<ILocation[]> {
      return xhr
        .get("/locations", { params })
        .then(({ data }) => data.locations)
    },
  }
}

export const getLocations = (
  params?: any
): ThunkAction<Promise<ILocation[]>> => (dispatch, getState, { xhr }) => {
  dispatch(actions.list.request())
  return XHR(xhr)
    .getLocations(params)
    .then(locations => {
      dispatch(actions.list.success(locations))
      return locations
    })
    .catch(error => {
      dispatch(actions.list.failure(error))
      return Promise.reject(error)
    })
}

interface StateProps {
  isFetching: boolean
  locations: ILocation[]
}
interface DispatchProps {
  getLocations: (params?: any) => Promise<ILocation[]>
}
interface OwnProps {}

export const connectWithList = connect<
  StateProps,
  DispatchProps,
  OwnProps,
  IStateWithKey
>(
  state => {
    const locationsSelector = selectors(state)
    return {
      isFetching: locationsSelector.isFetching,
      locations: locationsSelector.locations,
    }
  },
  (dispatch: ThunkDispatch) => ({
    getLocations: (params?: any) => dispatch(getLocations(params)),
  })
)

interface ListProps
  extends OwnProps,
    StateProps,
    DispatchProps,
    RouteComponentProps {}
function List({ getLocations, locations, isFetching }: ListProps) {
  useEffect(() => {
    getLocations()
  }, [])
  return (
    <Fragment>
      <Helmet>
        <title>Locations</title>
      </Helmet>
      {!isFetching ? `Total: ${locations.length}` : ""}
      <ul>
        {isFetching
          ? "Loading..."
          : locations.map(location => (
              <li key={location.id}>
                {location.name}
                {/* <Link to={`${location.id.toString()}/edit`}>Edit</Link> */}
              </li>
            ))}
      </ul>
    </Fragment>
  )
}

export default connectWithList(List)

interface SelectLocationsProps extends XHRProps, Omit<AsyncProps, "fetch"> {}

export const SelectLocations = withXHR<SelectLocationsProps>(
  function SelectLocations({ xhr, ...otherProps }: SelectLocationsProps) {
    return (
      <Async
        multiple
        {...otherProps}
        fetch={q => XHR(xhr).getLocations({ q })}
      />
    )
  }
)
