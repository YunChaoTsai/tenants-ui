import React, { useEffect, Fragment } from "react"
import { RouteComponentProps, Link, Redirect, Router } from "@reach/router"
import { connect } from "react-redux"
import { AxiosInstance } from "axios"

import { IHotel, IStateWithKey, selectors, actions } from "./store"
import { ThunkDispatch, ThunkAction } from "./../types"
import Prices from "./Prices"
import AddPrices from "./AddPrices"

export function XHR(xhr: AxiosInstance) {
  return {
    getHotel: (id: string): Promise<IHotel> =>
      xhr.get(`/hotels/${id}`).then(resp => resp.data.hotel),
  }
}

export const getHotel = (id: string): ThunkAction<Promise<IHotel>> => (
  dispatch,
  getState,
  { xhr }
) => {
  dispatch(actions.item.request())
  return XHR(xhr)
    .getHotel(id)
    .then(hotel => {
      dispatch(actions.item.success(hotel))
      return hotel
    })
    .catch(error => {
      dispatch(actions.item.failure(error))
      return Promise.reject(error)
    })
}

interface StateProps {
  isFetching: boolean
  hotel?: IHotel
}
interface DispatchProps {
  getHotel: (hotelId: string) => Promise<IHotel>
}
interface OwnProps {
  hotelId?: string
  render: (props: StateProps & { hotelId?: string }) => React.ReactNode
}

const connectWithItem = connect<
  StateProps,
  DispatchProps,
  OwnProps,
  IStateWithKey
>(
  (state, { hotelId }) => {
    const hotelSelector = selectors(state)
    return {
      isFetching: hotelSelector.isFetching,
      hotel: hotelSelector.getHotel(hotelId),
    }
  },
  (dispatch: ThunkDispatch) => ({
    getHotel: (hotelId: string) => dispatch(getHotel(hotelId)),
  })
)

interface ItemProps extends StateProps, DispatchProps, OwnProps {}

export const HotelDataProvider = connectWithItem(function HotelDataProvider({
  isFetching,
  hotel,
  getHotel,
  hotelId,
  render,
}: ItemProps) {
  useEffect(() => {
    hotelId && getHotel(hotelId)
  }, [])
  return <Fragment>{render({ hotel, isFetching, hotelId })}</Fragment>
})

export function Item({
  hotelId,
  navigate,
}: RouteComponentProps<{ hotelId: string }>) {
  if (!hotelId) {
    navigate && navigate("/hotels")
    return null
  }
  return (
    <HotelDataProvider
      hotelId={hotelId}
      render={({ hotel, isFetching }) => {
        if (isFetching) return "Loading..."
        if (!hotel) {
          navigate && navigate("/hotels")
          return null
        }
        const {
          id,
          name,
          eb_child_age_end,
          eb_child_age_start,
          meal_plans,
          room_types,
          locations,
        } = hotel
        return (
          <div>
            <Link to="..">Back</Link>
            <h3>{name}</h3>
            <div>
              Extra bed child ages: From {eb_child_age_start} To{" "}
              {eb_child_age_end}
            </div>
            <div>
              Meal Plans:{" "}
              {hotel.meal_plans.map(mealPlan => (
                <span key={mealPlan.id}>{mealPlan.name}</span>
              ))}
            </div>
            <div>
              Room Types:{" "}
              {room_types.map(roomType => (
                <span key={roomType.id}>{roomType.name}</span>
              ))}
            </div>
            <div>
              Locations:{" "}
              {locations.map(location => (
                <span key={location.id}>{location.name}</span>
              ))}
            </div>
            <div>
              <h4>Prices</h4>
              <Link to="add-prices">Add Prices</Link>
              <Router>
                <AddPrices path="add-prices" hotel={hotel} />
                <Prices path="/" hotel={hotel} />
              </Router>
            </div>
          </div>
        )
      }}
    />
  )
}

export default Item
