import React, { useEffect } from "react"
import { RouteComponentProps } from "@reach/router"
import { AxiosInstance } from "axios"
import { connect } from "react-redux"
import moment from "moment"

import { store as mealPlanStore } from "./../MealPlans"
import { store as roomTypeStore } from "./../RoomTypes"
import { store as locationStore } from "./../Locations"
import { ThunkAction, ThunkDispatch } from "./../types"
import { IPrice, IHotel, actions, selectors, IStateWithKey } from "./store"

export function XHR(xhr: AxiosInstance) {
  return {
    getPrices(hotelId: number | string, params?: any): Promise<IPrice[]> {
      return xhr
        .get(`/hotels/${hotelId}/prices`, { params })
        .then(resp => resp.data.prices)
    },
  }
}

export const getPrices = (
  hotelId: number,
  params?: any
): ThunkAction<Promise<IPrice[]>> => (dispatch, getState, { xhr }) => {
  dispatch(actions.prices.request())
  return XHR(xhr)
    .getPrices(hotelId, params)
    .then(prices => {
      dispatch(actions.prices.success(prices))
      return prices
    })
    .catch(error => {
      dispatch(actions.prices.failure(error))
      return Promise.reject(error)
    })
}

interface StateProps {
  prices: IPrice[]
  isFetching: boolean
}
interface DispatchProps {
  getPrices: (hotelId: number, params?: any) => Promise<IPrice[]>
}

interface OwnProps extends RouteComponentProps<{ hotelId: string }> {
  hotel: IHotel
}

interface PricesProps extends StateProps, DispatchProps, OwnProps {}

function Prices({
  getPrices,
  isFetching,
  prices,
  hotelId,
  hotel,
}: PricesProps) {
  if (!hotelId) return null
  const id = parseInt(hotelId, 10)
  if (isNaN(id)) return null
  useEffect(() => {
    getPrices(id)
  }, [])
  if (isFetching) return <span>Loading Prices....</span>
  if (!prices || prices.length === 0) return <span>No prices set</span>
  const { locations, meal_plans, room_types } = hotel
  function byIds<Item extends { id: number }>(
    arr: Item[]
  ): { [key: number]: Item } {
    return arr.reduce((byId: { [key: number]: Item }, item) => {
      byId[item.id] = item
      return byId
    }, {})
  }
  const locationById = byIds(locations)
  const mealPlansById = byIds(meal_plans)
  const roomTypesById = byIds(room_types)
  return (
    <table>
      <thead>
        <tr>
          <th>Start Date</th>
          <th>End Date</th>
          <th>Base Price</th>
          <th>Persons</th>
          <th>A.W.E.B.</th>
          <th>C.W.E.B.</th>
          <th>C.Wo.E.B.</th>
          <th>Meal Plan</th>
          <th>Room Type</th>
          <th>Location</th>
        </tr>
      </thead>
      <tbody>
        {prices.map(
          ({
            id,
            hotel_id,
            base_price,
            persons,
            start_date,
            end_date,
            a_w_e_b,
            c_w_e_b,
            c_wo_e_b,
            meal_plan_id,
            room_type_id,
            location_id,
          }) => (
            <tr key={id}>
              <td>
                {moment
                  .utc(start_date)
                  .local()
                  .format("DD MMM, YYYY")}
              </td>
              <td>
                {moment
                  .utc(end_date)
                  .local()
                  .format("DD MMM, YYYY")}
              </td>
              <td className="text--right">{base_price}</td>
              <td className="text--right">{persons}</td>
              <td className="text--right">{a_w_e_b}</td>
              <td className="text--right">{c_w_e_b}</td>
              <td className="text--right">{c_wo_e_b}</td>
              <td>{mealPlansById[meal_plan_id].name}</td>
              <td>{roomTypesById[room_type_id].name}</td>
              <td>{locationById[location_id].short_name}</td>
            </tr>
          )
        )}
      </tbody>
    </table>
  )
}

export default connect<StateProps, DispatchProps, OwnProps, IStateWithKey>(
  (state, { hotelId = "" }) => {
    const pricesSelector = selectors(state)
    const id = parseInt(hotelId, 10)
    return {
      isFetching: pricesSelector.isFetchingPrices,
      prices: pricesSelector.getHotelPrices(id),
    }
  },
  (dispatch: ThunkDispatch) => ({
    getPrices: (hotelId: number, params?: any) =>
      dispatch(getPrices(hotelId, params)),
  })
)(Prices)
