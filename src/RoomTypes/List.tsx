import React, { Fragment, useEffect, useCallback } from "react"
import Helmet from "react-helmet-async"
import { AxiosInstance } from "axios"
import { RouteComponentProps } from "@reach/router"
import { Omit } from "utility-types"
import { Table, Paginate } from "@tourepedia/ui"

import { IRoomType, actions, IStateWithKey, selectors } from "./store"
import { ThunkAction } from "./../types"
import { withXHR, XHRProps } from "./../xhr"
import { Async, AsyncProps } from "@tourepedia/select"
import Search, { useSearch } from "../Shared/Search"
import Listable from "../Shared/List"
import { Grid, Col } from "../Shared/Layout"
import { IPaginate } from "../model"
import { useSelector } from "react-redux"
import { useThunkDispatch } from "../utils"

export function XHR(xhr: AxiosInstance) {
  return {
    async getRoomTypes(
      params?: any
    ): Promise<{ data: IRoomType[]; meta: any }> {
      return xhr.get("/room-types", { params }).then(resp => resp.data)
    },
  }
}

export const getRoomTypesActions = (
  params?: any
): ThunkAction<Promise<IRoomType[]>> => async (dispatch, _, { xhr }) => {
  dispatch(actions.list.request())
  return XHR(xhr)
    .getRoomTypes(params)
    .then(data => {
      dispatch(actions.list.success(data))
      return data.data
    })
    .catch(error => {
      dispatch(actions.list.failure(error))
      return Promise.reject(error)
    })
}

export function useRoomTypesState() {
  interface StateProps extends IPaginate {
    roomTypes: IRoomType[]
  }
  return useSelector<IStateWithKey, StateProps>(state => {
    const roomTypesSelector = selectors(state)
    return {
      ...roomTypesSelector.meta,
      isFetching: roomTypesSelector.isFetching,
      roomTypes: roomTypesSelector.get(),
    }
  })
}

export function useRoomTypesFetch() {
  const dispatch = useThunkDispatch()
  return useCallback((params?: any) => dispatch(getRoomTypesActions(params)), [
    dispatch,
  ])
}

function useRoomTypes() {
  const state = useRoomTypesState()
  const fetchRoomTypes = useRoomTypesFetch()
  return {
    ...state,
    fetchRoomTypes,
  }
}

export default function List(_: RouteComponentProps) {
  const [params, setParams] = useSearch()
  const {
    fetchRoomTypes,
    roomTypes,
    total,
    from,
    to,
    currentPage,
    lastPage,
    isFetching,
  } = useRoomTypes()
  useEffect(() => {
    fetchRoomTypes({ page: currentPage })
  }, [fetchRoomTypes])
  return (
    <Fragment>
      <Helmet>
        <title>Room Types</title>
      </Helmet>
      <Grid>
        <Col>
          <Search
            onSearch={params => {
              setParams(params)
              fetchRoomTypes({ ...params, page: 1 })
            }}
          />
        </Col>
        <Col className="text-right">
          <Paginate
            total={total}
            from={from}
            to={to}
            isFetching={isFetching}
            currentPage={currentPage}
            lastPage={lastPage}
            onChange={page => fetchRoomTypes({ ...params, page })}
          />
        </Col>
      </Grid>
      <Listable total={total} isFetching={isFetching}>
        <Table
          bordered
          striped
          headers={["Name", "Description"]}
          rows={roomTypes.map(roomType => [
            roomType.name,
            roomType.description,
          ])}
        />
      </Listable>
    </Fragment>
  )
}

interface SelectRoomTypesProps extends XHRProps, Omit<AsyncProps, "fetch"> {}

export const SelectRoomTypes = withXHR<SelectRoomTypesProps>(
  function SelectRoomTypes({ xhr, ...otherProps }: SelectRoomTypesProps) {
    return (
      <Async
        multiple
        {...otherProps}
        fetch={q =>
          XHR(xhr)
            .getRoomTypes({ q })
            .then(resp => resp.data)
        }
      />
    )
  }
)
