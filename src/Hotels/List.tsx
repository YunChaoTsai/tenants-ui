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
      {isFetching ? "Loading..." : null}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Meal Plans</th>
            <th>Room Types</th>
            <th>Child extra bed age</th>
          </tr>
        </thead>
        <tbody>
          {hotels.map(hotel => (
            <tr key={hotel.id}>
              <td>
                <Link to={hotel.id.toString()}>
                  {hotel.name} • {hotel.location.short_name} • {hotel.stars}{" "}
                  star
                </Link>
              </td>
              <td>
                {hotel.meal_plans.map(mealPlan => mealPlan.name).join(" • ")}
              </td>
              <td>
                {hotel.room_types.map(roomType => roomType.name).join(" • ")}
              </td>
              <td>
                {hotel.extra_bed_child_age_start}-
                {hotel.extra_bed_child_age_end}yo
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
