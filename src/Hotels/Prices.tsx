import React, { useEffect, Fragment, useCallback } from "react"
import { RouteComponentProps } from "@reach/router"
import { AxiosInstance } from "axios"
import { useSelector } from "react-redux"
import moment from "moment"
import { Table, Paginate } from "@tourepedia/ui"

import { ThunkAction } from "./../types"
import {
  IPrice,
  IHotel,
  priceActions as actions,
  selectors,
  IStateWithKey,
} from "./store"
import List from "../Shared/List"
import Search, { useSearch } from "../Shared/Search"
import { Grid, Col } from "../Shared/Layout"
import { IPaginate } from "../model"
import { useThunkDispatch } from "../utils"

export function XHR(xhr: AxiosInstance) {
  return {
    async getPrices(
      hotelId: number | string,
      params?: any
    ): Promise<{ data: IPrice[]; meta: any }> {
      return xhr
        .get(`/hotel-prices`, { params: { ...params, hotels: [hotelId] } })
        .then(resp => resp.data)
    },
  }
}

export const getPricesAction = (
  hotelId: number,
  params?: any
): ThunkAction<Promise<IPrice[]>> => async (dispatch, _, { xhr }) => {
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

export function useHotelPrices(hotelId: number | string) {
  interface StateProps extends IPaginate {
    prices: IPrice[]
    isFetching: boolean
  }
  return useSelector<IStateWithKey, StateProps>(state => {
    const pricesSelector = selectors(state)
    const id = parseInt(hotelId.toString(), 10)
    return {
      ...pricesSelector.prices.meta,
      isFetching: pricesSelector.prices.isFetching,
      prices: pricesSelector.getHotelPrices(id),
    }
  })
}

interface PricesProps extends RouteComponentProps<{ hotelId: string }> {
  hotel: IHotel
}

export default function Prices({ hotelId }: PricesProps) {
  const [params, setParams] = useSearch()
  let id: number = parseInt(hotelId || "", 10)
  const dispatch = useThunkDispatch()
  const getPrices = useCallback(
    (hotelId: number, params?: any) =>
      dispatch(getPricesAction(hotelId, params)),
    [dispatch, hotelId]
  )
  useEffect(() => {
    id && getPrices(id, { page: currentPage })
  }, [id, getPrices])
  const {
    prices,
    total,
    from,
    to,
    currentPage,
    lastPage,
    isFetching,
  } = useHotelPrices(id)
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
              getPrices(id, { ...params, page: 1 })
            }}
          />
        </Col>
        <Col className="text-right">
          <Paginate
            total={total}
            from={from}
            to={to}
            currentPage={currentPage}
            lastPage={lastPage}
            isFetching={isFetching}
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
