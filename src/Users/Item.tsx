import React, { useEffect, Fragment, useCallback } from "react"
import { RouteComponentProps, Link, Redirect } from "@reach/router"
import Helmet from "react-helmet-async"
import { AxiosInstance } from "axios"
import moment from "moment"

import { ThunkAction } from "./../types"
import { IUser, actions, IStateWithKey, selectors } from "./store"
import { useSelector } from "react-redux"
import { useThunkDispatch } from "../utils"
import Spinner from "../Shared/Spinner"

function XHR(xhr: AxiosInstance) {
  return {
    async getUser(id: string): Promise<IUser> {
      return xhr.get(`/users/${id}`).then(({ data }) => data.data)
    },
  }
}

export const getUserAction = (
  id: string
): ThunkAction<Promise<IUser>> => async (dispatch, _, { xhr }) => {
  dispatch(actions.item.request())
  return XHR(xhr)
    .getUser(id)
    .then(user => {
      dispatch(actions.item.success(user))
      return user
    })
    .catch(error => {
      dispatch(actions.item.failure(error))
      return Promise.reject(error)
    })
}

export function useUserState(userId?: string | number) {
  interface StateProps {
    isFetching: boolean
    user?: IUser
  }
  return useSelector<IStateWithKey, StateProps>(state => {
    const usersSelector = selectors(state)
    return {
      isFetching: usersSelector.isFetching,
      user: usersSelector.getItem(userId),
    }
  })
}

export function useUserFetch() {
  const dispatch = useThunkDispatch()
  return useCallback((userId: string) => dispatch(getUserAction(userId)), [
    dispatch,
  ])
}

export function useUser(userId?: string, shouldFetch: boolean = false) {
  const state = useUserState(userId)
  const fetchUser = useUserFetch()
  useEffect(() => {
    if (shouldFetch) {
      userId && fetchUser(userId)
    }
  }, [shouldFetch, userId, fetchUser])
  return {
    ...state,
    fetchUser,
  }
}

export default function User({
  navigate,
  userId,
}: RouteComponentProps<{ userId: string }>) {
  const { user, isFetching } = useUser(userId, true)
  if (!userId) {
    navigate && navigate("/users")
    return null
  }
  return (
    <Fragment>
      <Helmet>
        <title>{user ? user.name : ""} | User</title>
      </Helmet>
      <Link to="..">Back to list</Link>
      {isFetching ? (
        <div className="text-center">
          <Spinner />
        </div>
      ) : user ? (
        <div>
          <h3>
            {user.name}{" "}
            <Link to="edit" title="Edit Name">
              &#9998;
            </Link>
          </h3>
          <p>
            Roles:{" "}
            {(user.roles || []).map((r, i, arr) => (
              <span key={r.id}>
                {r.name}
                {i !== arr.length - 1 ? " • " : ""}
              </span>
            ))}
            <Link to="edit-roles" title="Edit Roles">
              &#9998;
            </Link>
          </p>
          Email Verified on:{" "}
          {user.email_verified_at
            ? moment
                .utc(user.email_verified_at)
                .local()
                .format("Do MMM, YYYY \\at hh:mm A")
            : "Not verified yet"}
          <br />
          Invited on:{" "}
          {moment
            .utc(user.created_at)
            .local()
            .format("Do MMM, YYYY \\at hh:mm A")}
        </div>
      ) : (
        <Redirect noThrow to="/users" />
      )}
    </Fragment>
  )
}
