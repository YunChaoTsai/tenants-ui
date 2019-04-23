import React, { useEffect } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import { connect } from "react-redux"
import { AxiosInstance } from "axios"
import moment from "moment"

import { ITrip, IStateWithKey, actions, selectors } from "./store"
import { ThunkAction, ThunkDispatch } from "./../types"

export function XHR(xhr: AxiosInstance) {
  return {
    getTrips(params?: any): Promise<ITrip[]> {
      return xhr.get("/trips").then(resp => resp.data.trips)
    },
  }
}

export const getTrips = (params?: any): ThunkAction<Promise<ITrip[]>> => (
  dispatch,
  getState,
  { xhr }
) => {
  dispatch(actions.list.request())
  return XHR(xhr)
    .getTrips(params)
    .then(trips => {
      dispatch(actions.list.success(trips))
      return trips
    })
    .catch(error => {
      dispatch(actions.list.failure(error))
      return Promise.reject(error)
    })
}

interface StateProps {
  isFetching: boolean
  trips: ITrip[]
}
interface DispatchProps {
  getTrips: (params?: any) => Promise<ITrip[]>
}
interface OwnProps extends RouteComponentProps {}

interface ListProps extends StateProps, DispatchProps, OwnProps {}

export const connectWithList = connect<
  StateProps,
  DispatchProps,
  OwnProps,
  IStateWithKey
>(
  state => {
    const tripSelector = selectors(state)
    return {
      isFetching: tripSelector.isFetching,
      trips: tripSelector.trips,
    }
  },
  (dispatch: ThunkDispatch) => ({
    getTrips: (params?: any) => dispatch(getTrips(params)),
  })
)

function List({ isFetching, trips, getTrips }: ListProps) {
  useEffect(() => {
    getTrips()
  }, [])
  if (isFetching) return <span>Loading...</span>
  return (
    <div>
      <div>Total: {trips.length}</div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Dates</th>
            <th>Stage</th>
            <th>Destinations</th>
            <th>Traveler</th>
            <th>Persons</th>
          </tr>
        </thead>
        <tbody>
          {trips.map(
            ({
              id,
              trip_source,
              trip_id,
              start_date,
              end_date,
              locations,
              no_of_adults,
              children,
              primary_contact,
              latest_stage,
            }) => (
              <tr key={id}>
                <td>
                  <Link to={id.toString()}>
                    {trip_source.short_name}-{trip_id}
                  </Link>
                </td>
                <td>
                  {moment
                    .utc(start_date)
                    .local()
                    .format("DD MMM, YYYY")}
                  {" to "}
                  {moment
                    .utc(end_date)
                    .local()
                    .format("DD MMM, YYYY")}
                </td>
                <td>{latest_stage ? latest_stage.name : "Initiated"}</td>
                <td>{locations.map(l => l.short_name).join(" • ")}</td>
                <td>
                  {primary_contact ? (
                    <div>
                      {primary_contact.name}
                      <br />
                      {primary_contact.phone_number}&lt;{primary_contact.email}
                      &gt;
                    </div>
                  ) : null}
                </td>
                <td>
                  {no_of_adults} Adults{children ? " with " + children : ""}
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  )
}

export default connectWithList(List)
