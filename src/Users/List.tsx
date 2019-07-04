import React, { useEffect, Fragment, useCallback } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import Helmet from "react-helmet-async"
import { AxiosInstance } from "axios"
import moment from "moment"
import { Table, Paginate } from "@tourepedia/ui"

import { ThunkAction } from "./../types"
import { IUser, actions, IStateWithKey, selectors } from "./store"
import { List } from "./../Shared/List"
import { Search, useSearch } from "./../Shared/Search"
import { Grid, Col } from "../Shared/Layout"
import { IPaginate } from "../model"
import { useSelector } from "react-redux"
import { useThunkDispatch } from "../utils"

export function XHR(xhr: AxiosInstance) {
  return {
    async getUsers(params?: any): Promise<{ data: IUser[]; meta: any }> {
      return xhr.get("/users", { params }).then(resp => resp.data)
    },
  }
}

export const getUsersAction = (
  params?: any
): ThunkAction<Promise<IUser[]>> => async (dispatch, _, { xhr }) => {
  dispatch(actions.list.request())
  return XHR(xhr)
    .getUsers(params)
    .then(({ data, meta }) => {
      dispatch(actions.list.success({ data, meta }))
      return data
    })
    .catch(error => {
      dispatch(actions.list.failure(error))
      return Promise.reject(error)
    })
}

function useUsersState() {
  interface StateProps extends IPaginate {
    users: IUser[]
  }
  return useSelector<IStateWithKey, StateProps>(state => {
    const usersSelector = selectors(state)
    return {
      ...usersSelector.meta,
      isFetching: usersSelector.isFetching,
      users: usersSelector.get(),
    }
  })
}

function useUsersFetch() {
  const dispatch = useThunkDispatch()
  return useCallback((params?: any) => dispatch(getUsersAction(params)), [
    dispatch,
  ])
}

function useUsers() {
  return {
    ...useUsersState(),
    fetchUsers: useUsersFetch(),
  }
}

export default function Users({  }: RouteComponentProps) {
  const [params, setParams] = useSearch()
  const {
    fetchUsers: getUsers,
    users,
    total,
    from,
    to,
    currentPage,
    lastPage,
    isFetching,
  } = useUsers()
  useEffect(() => {
    getUsers({ page: currentPage })
  }, [getUsers])
  return (
    <Fragment>
      <Helmet>
        <title>Users</title>
      </Helmet>
      <Grid>
        <Col>
          <Search
            onSearch={params => {
              setParams(params)
              getUsers({ ...params, page: 1 })
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
            onChange={page => getUsers({ ...params, page })}
          />
        </Col>
      </Grid>
      <List isFetching={isFetching} total={total}>
        <Table
          striped
          bordered
          responsive
          headers={["Name", "Email", "Roles", "Email Verified At"]}
          rows={users.map(r => [
            <Link to={r.id.toString()}>{r.name}</Link>,
            <span>{r.email}</span>,
            <span>{r.roles.map(r => r.name).join(" • ")}</span>,
            <span>
              {r.email_verified_at
                ? moment
                    .utc(r.email_verified_at)
                    .local()
                    .format("Do MMM, YYYY \\at hh:mm A")
                : "Not Verified Yet"}
            </span>,
          ])}
        />
      </List>
    </Fragment>
  )
}
