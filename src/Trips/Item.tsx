import React, { useEffect } from "react"
import { RouteComponentProps, Link, Router } from "@reach/router"
import Button from "@tourepedia/button"
import { AxiosInstance } from "axios"
import { connect } from "react-redux"
import moment from "moment"
import Helmet from "react-helmet-async"

import { InputField } from "./../Shared/InputField"
import { ITrip, actions, IStateWithKey, selectors } from "./store"
import { ThunkAction, ThunkDispatch } from "./../types"
import Quotes from "./Quotes"
import NewQuote from "./NewQuote"

export function XHR(xhr: AxiosInstance) {
  return {
    getTrip(tripId: string): Promise<ITrip> {
      return xhr.get(`/trips/${tripId}`).then(resp => resp.data.trip)
    },
  }
}

export const getTrip = (tripId: string): ThunkAction<Promise<ITrip>> => (
  dispatch,
  getState,
  { xhr }
) => {
  dispatch(actions.item.request())
  return XHR(xhr)
    .getTrip(tripId)
    .then(trip => {
      dispatch(actions.item.success(trip))
      return trip
    })
    .catch(error => {
      dispatch(actions.item.failure(error))
      return Promise.reject(error)
    })
}

interface StateProps {
  isFetching: boolean
  trip?: ITrip
}
interface DispatchProps {
  getTrip: (tripId: string) => Promise<ITrip>
}
interface OwnProps extends RouteComponentProps<{ tripId: string }> {}

interface ItemProps extends StateProps, DispatchProps, OwnProps {}

const connectWithItem = connect<
  StateProps,
  DispatchProps,
  OwnProps,
  IStateWithKey
>(
  (state, ownProps) => {
    const tripSelector = selectors(state)
    return {
      isFetching: tripSelector.isFetching,
      trip: tripSelector.getTrip(ownProps.tripId),
    }
  },
  (dispatch: ThunkDispatch) => ({
    getTrip: (tripId: string) => dispatch(getTrip(tripId)),
  })
)

function Item({ tripId, isFetching, getTrip, navigate, trip }: ItemProps) {
  useEffect(() => {
    tripId && getTrip(tripId)
  }, [])
  if (!tripId) {
    navigate && navigate("..")
    return null
  }
  if (isFetching) return <span>Loading...</span>
  if (!trip) {
    navigate && navigate("..")
    return null
  }
  const {
    id,
    start_date,
    end_date,
    locations,
    no_of_adults,
    children,
    trip_source,
    trip_id,
  } = trip
  return (
    <div>
      <Link to="..">Back</Link>
      <Helmet>
        <title>
          {locations.map(l => l.short_name).join(" • ")} (
          {trip_source.short_name}-{trip_id})
        </title>
      </Helmet>
      <h3>
        {locations.map(l => l.short_name).join(" • ")} ({trip_source.short_name}
        -{trip_id}) from{" "}
        {moment
          .utc(start_date)
          .local()
          .format("DD MMM, YYYY")}{" "}
        to{" "}
        {moment
          .utc(end_date)
          .local()
          .format("DD MMM, YYYY")}{" "}
        with {no_of_adults} Adults{children ? ` and ${children} children` : ""}
      </h3>
      <Link to="quotes">Quotes</Link> • <Link to="new-quote">New Quote</Link>
      <Router>
        <Quotes path="quotes" trip={trip} />
        <NewQuote path="new-quote" trip={trip} />
        <Quotes path="/" trip={trip} />
      </Router>
    </div>
  )
}

export default connectWithItem(Item)
