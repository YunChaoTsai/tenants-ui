import React, { useEffect, Fragment } from "react"
import { RouteComponentProps } from "@reach/router"
import { AxiosInstance } from "axios"
import { connect } from "react-redux"
import moment from "moment"

import { ThunkAction, ThunkDispatch } from "./../types"
import {
  IPrice,
  IHotel,
  priceActions as actions,
  selectors,
  IStateWithKey,
} from "./store"
import Paginate, { PaginateProps } from "../Shared/Paginate"
import List from "../Shared/List"
import Search, { useSearch } from "../Shared/Search"

export function XHR(xhr: AxiosInstance) {
  return {
    getPrices(
      hotelId: number | string,
      params?: any
    ): Promise<{ data: IPrice[]; meta: any }> {
      return xhr
        .get(`/hotels/${hotelId}/prices`, { params })
        .then(resp => resp.data)
    },
  }
}

export const getPrices = (
  hotelId: number,
  params?: any
): ThunkAction<Promise<IPrice[]>> => (dispatch, getState, { xhr }) => {
  dispatch(actions.list.request())
  return XHR(xhr)
    .getPrices(hotelId, params)
    .then(prices => {
      dispatch(actions.list.success(prices))
      return prices.data
    })
    .catch(error => {
      dispatch(actions.list.failure(error))
      return Promise.reject(error)
    })
}

interface StateProps extends PaginateProps {
  prices: IPrice[]
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
  prices,
  hotelId,
  hotel,
  ...otherProps
}: PricesProps) {
  const { isFetching, total, currentPage } = otherProps
  const [params, setParams] = useSearch()
  if (!hotelId) return null
  const id = parseInt(hotelId, 10)
  if (isNaN(id)) return null
  useEffect(() => {
    getPrices(id, { page: currentPage })
  }, [])
  return (
    <Fragment>
      <div className="display--flex justify-content--space-between">
        <Search
          onSearch={params => {
            setParams(params)
            getPrices({ ...params, page: 1 })
          }}
        />
        <Paginate {...otherProps} onChange={page => getPrices(id, { page })} />
      </div>
      <List isFetching={isFetching} total={total}>
        <table className="table--fixed">
          <thead>
            <tr>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Meal Plan</th>
              <th>Room Type</th>
              <th className="text--right">Base Price</th>
              <th className="text--right">Persons</th>
              <th className="text--right">A.W.E.B.</th>
              <th className="text--right">C.W.E.B.</th>
              <th className="text--right">C.Wo.E.B</th>
            </tr>
          </thead>
          <tbody>
            {prices.map(
              ({
                id,
                base_price,
                persons,
                start_date,
                end_date,
                adult_with_extra_bed_price,
                child_with_extra_bed_price,
                child_without_extra_bed_price,
                meal_plan,
                room_type,
              }) => (
                <tr key={id}>
                  <td>
                    {moment
                      .utc(start_date)
                      .local()
                      .format("DD/MM/YYYY")}
                  </td>
                  <td>
                    {moment
                      .utc(end_date)
                      .local()
                      .format("DD/MM/YYYY")}
                  </td>
                  <td>{meal_plan.name}</td>
                  <td>{room_type.name}</td>
                  <td className="text--right">{base_price}</td>
                  <td className="text--right">{persons}</td>
                  <td className="text--right">{adult_with_extra_bed_price}</td>
                  <td className="text--right">{child_with_extra_bed_price}</td>
                  <td className="text--right">
                    {child_without_extra_bed_price}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </List>
    </Fragment>
  )
}

export default connect<StateProps, DispatchProps, OwnProps, IStateWithKey>(
  (state, { hotelId = "" }) => {
    const pricesSelector = selectors(state)
    const id = parseInt(hotelId, 10)
    return {
      ...pricesSelector.prices.meta,
      isFetching: pricesSelector.prices.isFetching,
      prices: pricesSelector.getHotelPrices(id),
    }
  },
  (dispatch: ThunkDispatch) => ({
    getPrices: (hotelId: number, params?: any) =>
      dispatch(getPrices(hotelId, params)),
  })
)(Prices)
