import React, { Fragment, useEffect } from "react"
import Helmet from "react-helmet-async"
import { connect } from "react-redux"
import { AxiosInstance } from "axios"
import { RouteComponentProps } from "@reach/router"
import { Omit } from "utility-types"

import { IHotelBookingStage, actions, IStateWithKey, selectors } from "./store"
import { ThunkAction, ThunkDispatch } from "./../types"
import { withXHR, XHRProps } from "./../xhr"
import { Async, AsyncProps } from "@tourepedia/select"
import Paginate, { PaginateProps } from "../Shared/Paginate"
import Search, { useSearch } from "../Shared/Search"
import Listable from "../Shared/List"
import { Table } from "@tourepedia/ui"
import { Grid, Col } from "../Shared/Layout"

export function XHR(xhr: AxiosInstance) {
  return {
    getHotelBookingStages(
      params?: any
    ): Promise<{ data: IHotelBookingStage[]; meta: any }> {
      return xhr
        .get("/hotel-booking-stages", { params })
        .then(resp => resp.data)
    },
  }
}

export const getHotelBookingStages = (
  params?: any
): ThunkAction<Promise<IHotelBookingStage[]>> => (
  dispatch,
  getState,
  { xhr }
) => {
  dispatch(actions.list.request())
  return XHR(xhr)
    .getHotelBookingStages(params)
    .then(({ data, meta }) => {
      dispatch(actions.list.success({ data, meta }))
      return data
    })
    .catch(error => {
      dispatch(actions.list.failure(error))
      return Promise.reject(error)
    })
}

interface StateProps extends PaginateProps {
  hotelBookingStages: IHotelBookingStage[]
}
interface DispatchProps {
  getHotelBookingStages: (params?: any) => Promise<any>
}
interface OwnProps {}

export const connectWithList = connect<
  StateProps,
  DispatchProps,
  OwnProps,
  IStateWithKey
>(
  state => {
    const hotelBookingStagesSelector = selectors(state)
    return {
      ...hotelBookingStagesSelector.meta,
      isFetching: hotelBookingStagesSelector.isFetching,
      hotelBookingStages: hotelBookingStagesSelector.get(),
    }
  },
  (dispatch: ThunkDispatch) => ({
    getHotelBookingStages: (params?: any) =>
      dispatch(getHotelBookingStages(params)),
  })
)

interface ListProps
  extends OwnProps,
    StateProps,
    DispatchProps,
    RouteComponentProps {}
function List({
  getHotelBookingStages,
  hotelBookingStages,
  ...otherProps
}: ListProps) {
  const { isFetching, total, currentPage } = otherProps
  const [params, setParams] = useSearch()
  useEffect(() => {
    getHotelBookingStages({ page: currentPage })
  }, [])
  return (
    <Fragment>
      <Helmet>
        <title>Hotel Booking Stages</title>
      </Helmet>
      <Grid>
        <Col>
          <Search
            onSearch={params => {
              setParams(params)
              getHotelBookingStages({ ...params, page: 1 })
            }}
          />
        </Col>
        <Col className="text-right">
          <Paginate
            {...otherProps}
            onChange={page => getHotelBookingStages({ ...params, page })}
          />
        </Col>
      </Grid>
      <Listable total={total} isFetching={isFetching}>
        <Table
          bordered
          striped
          headers={["Name", "Description"]}
          rows={hotelBookingStages.map(hotelBookingStage => [
            hotelBookingStage.name,
            hotelBookingStage.description,
          ])}
        />
      </Listable>
    </Fragment>
  )
}

export default connectWithList(List)

interface SelectHotelBookingStageProps
  extends XHRProps,
    Omit<AsyncProps, "fetch"> {}

export const SelectHotelBookingStages = withXHR<SelectHotelBookingStageProps>(
  function SelectHotelBookingStages({
    xhr,
    ...otherProps
  }: SelectHotelBookingStageProps) {
    return (
      <Async
        multiple
        {...otherProps}
        fetch={q =>
          XHR(xhr)
            .getHotelBookingStages({ q })
            .then(resp => resp.data)
        }
      />
    )
  }
)
