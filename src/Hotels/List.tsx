import React, { useEffect, Fragment } from "react"
import { connect } from "react-redux"
import { RouteComponentProps, Link } from "@reach/router"
import { AxiosInstance } from "axios"
import { Omit } from "utility-types"

import { IHotel, actions, IStateWithKey, selectors } from "./store"
import { ThunkAction, ThunkDispatch } from "./../types"
import { withXHR, XHRProps } from "./../xhr"
import { Async, AsyncProps } from "./../Shared/Select"

export function XHR(xhr: AxiosInstance) {
  return {
    getHotels(params?: any): Promise<IHotel[]> {
      return xhr.get("/hotels", { params }).then(resp => resp.data.hotels)
    },
  }
}

export const getHotels = (params?: any): ThunkAction<Promise<IHotel[]>> => (
  dispatch,
  getState,
  { xhr }
) => {
  dispatch(actions.list.request())
  return XHR(xhr)
    .getHotels(params)
    .then(hotels => {
      dispatch(actions.list.success(hotels))
      return hotels
    })
    .catch(error => {
      dispatch(actions.list.failure(error))
      return Promise.reject(error)
    })
}

interface StateProps {
  isFetching: boolean
  hotels: IHotel[]
}
interface DispatchProps {
  getHotels: (params?: any) => Promise<IHotel[]>
}

interface OwnProps {}

export const connectWithList = connect<
  StateProps,
  DispatchProps,
  OwnProps,
  IStateWithKey
>(
  state => {
    const hotelsSelector = selectors(state)
    return {
      isFetching: hotelsSelector.isFetching,
      hotels: hotelsSelector.hotels,
    }
  },
  (dispatch: ThunkDispatch) => ({
    getHotels: (params?: any) => dispatch(getHotels(params)),
  })
)

interface ListProps
  extends StateProps,
    DispatchProps,
    OwnProps,
    RouteComponentProps {}

function List({ isFetching, getHotels, hotels }: ListProps) {
  useEffect(() => {
    getHotels()
  }, [])
  return (
    <Fragment>
      {!isFetching ? `Total: ${hotels.length}` : ""}
      <ul>
        {isFetching
          ? "Loading..."
          : hotels.map(hotel => (
              <li key={hotel.id}>
                <Link to={hotel.id.toString()}>{hotel.name}</Link>
                <div>
                  Extra bed child ages: From {hotel.eb_child_age_start} To{" "}
                  {hotel.eb_child_age_end}
                </div>
                <div>
                  Meal Plans:{" "}
                  {hotel.meal_plans.map(mealPlan => (
                    <span key={mealPlan.id}>{mealPlan.name}</span>
                  ))}
                </div>
                <div>
                  Room Types:{" "}
                  {hotel.room_types.map(roomType => (
                    <span key={roomType.id}>{roomType.name}</span>
                  ))}
                </div>
                <div>
                  Locations:{" "}
                  {hotel.locations.map(location => (
                    <span key={location.id}>{location.name}</span>
                  ))}
                </div>
              </li>
            ))}
      </ul>
    </Fragment>
  )
}

export default connectWithList(List)

interface SelectLocationsProps extends XHRProps, Omit<AsyncProps, "fetch"> {}

export const SelectHotels = withXHR<SelectLocationsProps>(
  function SelectHotels({ xhr, ...otherProps }: SelectLocationsProps) {
    return (
      <Async multiple {...otherProps} fetch={q => XHR(xhr).getHotels({ q })} />
    )
  }
)
