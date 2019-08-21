import React, { useEffect, Fragment, useCallback } from "react"
import { RouteComponentProps } from "@reach/router"
import { AxiosInstance } from "axios"
import { useSelector } from "react-redux"
import moment from "moment"
import { Table, Paginate } from "@tourepedia/ui"

import { ThunkAction } from "./../types"
import { IHotelPrice, selectors, actions, IStateWithKey } from "./store"
import List from "../Shared/List"
import Search, { useSearch } from "../Shared/Search"
import { Grid, Col } from "../Shared/Layout"
import { IPaginate } from "../model"
import { useThunkDispatch, numberToLocalString } from "../utils"

export function XHR(xhr: AxiosInstance) {
  return {
    async getPrices(params?: any): Promise<{ data: IHotelPrice[]; meta: any }> {
      return xhr.get(`/hotel-prices`, { params }).then(resp => resp.data)
    },
  }
}

export const getPricesAction = (
  params?: any
): ThunkAction<Promise<IHotelPrice[]>> => async (dispatch, _, { xhr }) => {
  dispatch(actions.list.request())
  return XHR(xhr)
    .getPrices(params)
    .then(prices => {
      dispatch(actions.list.success(prices))
      return prices.data
    })
    .catch(error => {
      dispatch(actions.list.failure(error))
      return Promise.reject(error)
    })
}

export function useHotelPrices() {
  interface StateProps extends IPaginate {
    prices: IHotelPrice[]
    isFetching: boolean
  }
  return useSelector<IStateWithKey, StateProps>(state => {
    const pricesSelector = selectors(state)
    return {
      ...pricesSelector.meta,
      isFetching: pricesSelector.isFetching,
      prices: pricesSelector.get(),
    }
  })
}

interface PricesProps
  extends RouteComponentProps<{
    hotelId?: string | number
  }> {}

export default function Prices({ hotelId }: PricesProps) {
  const [params, setParams] = useSearch()
  const dispatch = useThunkDispatch()
  const getPrices = useCallback(
    (params?: any) =>
      dispatch(
        getPricesAction({
          ...params,
          ...(hotelId ? { hotels: [hotelId] } : {}),
        })
      ),
    [dispatch, hotelId]
  )
  useEffect(() => {
    getPrices({ page: currentPage })
  }, [getPrices])
  const {
    prices,
    total,
    from,
    to,
    currentPage,
    lastPage,
    isFetching,
  } = useHotelPrices()
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
            total={total}
            from={from}
            to={to}
            currentPage={currentPage}
            lastPage={lastPage}
            isFetching={isFetching}
            onChange={page => getPrices({ page })}
          />
        </Col>
      </Grid>
      <List isFetching={isFetching} total={total}>
        <Table
          responsive
          bordered
          striped
          headers={["Start Date", "End Date"]
            .concat(!hotelId ? ["Hotel"] : [])
            .concat([
              "Meal Plan",
              "Room Type",
              "Base Price",
              "Persons",
              "A.W.E.B.",
              "C.W.E.B.",
              "C.Wo.E.B",
            ])}
          alignCols={{
            5: "right",
            6: "right",
            7: "right",
            8: "right",
            9: "right",
          }}
          rows={prices.map(
            ({
              base_price,
              persons,
              start_date,
              end_date,
              hotel,
              adult_with_extra_bed_price,
              child_with_extra_bed_price,
              child_without_extra_bed_price,
              meal_plan,
              room_type,
            }) =>
              ([
                moment
                  .utc(start_date)
                  .local()
                  .format("DD/MM/YYYY"),
                moment
                  .utc(end_date)
                  .local()
                  .format("DD/MM/YYYY"),
              ] as any)
                .concat(
                  !hotelId
                    ? [
                        <span>
                          {hotel.name}{" "}
                          <small>
                            ({hotel.location.short_name} - {hotel.stars} Star)
                          </small>
                        </span>,
                      ]
                    : []
                )
                .concat([
                  meal_plan.name,
                  room_type.name,
                  numberToLocalString(base_price),
                  persons.toString(),
                  numberToLocalString(adult_with_extra_bed_price),
                  numberToLocalString(child_with_extra_bed_price),
                  numberToLocalString(child_without_extra_bed_price),
                ])
          )}
        />
      </List>
    </Fragment>
  )
}
