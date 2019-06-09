import React, { useEffect, Fragment } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import Helmet from "react-helmet-async"
import { AxiosInstance } from "axios"
import { connect } from "react-redux"
import moment from "moment"

import { ThunkAction, ThunkDispatch } from "./../types"
import { IUser, actions, IStateWithKey, selectors } from "./store"
import { List } from "./../Shared/List"
import { Paginate, PaginateProps } from "./../Shared/Paginate"
import { Search, useSearch } from "./../Shared/Search"
import { Table } from "@tourepedia/ui"
import { Grid, Col } from "../Shared/Layout"

export function XHR(xhr: AxiosInstance) {
  return {
    getUsers(params?: any): Promise<{ data: IUser[]; meta: any }> {
      return xhr.get("/users", { params }).then(resp => resp.data)
    },
  }
}

export const getUsers = (params?: any): ThunkAction<Promise<IUser[]>> => (
  dispatch,
  getState,
  { xhr }
) => {
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

interface StateProps extends PaginateProps {
  users: IUser[]
}
interface DispatchProps {
  getUsers: (params?: any) => Promise<any>
}
interface OwnProps extends RouteComponentProps {}
interface UsersProps extends OwnProps, StateProps, DispatchProps {}
export function Users({ getUsers, users, ...otherProps }: UsersProps) {
  const [params, setParams] = useSearch()
  const { currentPage, total, isFetching } = otherProps
  useEffect(() => {
    getUsers({ page: currentPage })
  }, [])
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
            {...otherProps}
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

export default connect<StateProps, DispatchProps, OwnProps, IStateWithKey>(
  state => {
    const usersSelector = selectors(state)
    return {
      ...usersSelector.meta,
      isFetching: usersSelector.isFetching,
      users: usersSelector.get(),
    }
  },
  (dispatch: ThunkDispatch) => ({
    getUsers: (params?: any) => dispatch(getUsers(params)),
  })
)(Users)
