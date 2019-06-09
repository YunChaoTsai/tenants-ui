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
import { Table } from "@tourepedia/ui"
import { Grid, Col } from "../Shared/Layout"

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
  let id: number = parseInt(hotelId || "", 10)
  useEffect(() => {
    if (id) {
      getPrices(id, { page: currentPage })
    }
  }, [])
  if (isNaN(id)) {
    return null
  }
  return (
    <Fragment>
      <Grid>
        <Col>
          <Search
            initialParams={params}
            onSearch={params => {
              setParams(params)
              getPrices({ ...params, page: 1 })
            }}
          />
        </Col>
        <Col className="text-right">
          <Paginate
            {...otherProps}
            onChange={page => getPrices(id, { page })}
          />
        </Col>
      </Grid>
      <List isFetching={isFetching} total={total}>
        <Table
          responsive
          bordered
          striped
          headers={[
            "Start Date",
            "End Date",
            "Meal Plan",
            "Room Type",
            "Base Price",
            "Persons",
            "A.W.E.B.",
            "C.W.E.B.",
            "C.Wo.E.B",
          ]}
          alignCols={{
            4: "right",
            5: "right",
            6: "right",
            7: "right",
            8: "right",
          }}
          rows={prices.map(
            ({
              base_price,
              persons,
              start_date,
              end_date,
              adult_with_extra_bed_price,
              child_with_extra_bed_price,
              child_without_extra_bed_price,
              meal_plan,
              room_type,
            }) => [
              moment
                .utc(start_date)
                .local()
                .format("DD/MM/YYYY"),
              moment
                .utc(end_date)
                .local()
                .format("DD/MM/YYYY"),
              meal_plan.name,
              room_type.name,
              base_price,
              persons,
              adult_with_extra_bed_price,
              child_with_extra_bed_price,
              child_without_extra_bed_price,
            ]
          )}
        />
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
