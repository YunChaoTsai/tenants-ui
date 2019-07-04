import React, { useEffect, Fragment, useCallback } from "react"
import { useSelector } from "react-redux"
import { Redirect, Location } from "@reach/router"
import { AxiosInstance } from "axios"

import { selectors, actions, IUser, IStateWithKey } from "./store"
import { ThunkAction } from "./../types"
import { useThunkDispatch } from "../utils"

function XHR(xhr: AxiosInstance) {
  return {
    async getUser(): Promise<IUser> {
      return xhr.get("/me").then(({ data }: { data: { data: IUser } }) => {
        return data.data
      })
    },
  }
}
export const getUserAction = (): ThunkAction<Promise<IUser>> => async (
  dispatch,
  _,
  { xhr }
) => {
  dispatch(actions.checkAuth.request())
  return XHR(xhr)
    .getUser()
    .then(user => {
      dispatch(actions.checkAuth.success(user))
      return user
    })
    .catch(error => {
      dispatch(actions.checkAuth.failure(error))
      return Promise.reject(error)
    })
}

export function useAuthUserState() {
  interface StateProps {
    user?: IUser
    wait: boolean
    isAuthenticating: boolean
    isAuthenticated: boolean
  }
  return useSelector<IStateWithKey, StateProps>(state => {
    const userSelector = selectors(state)
    return {
      user: userSelector.user,
      wait: userSelector.wait,
      isAuthenticating: userSelector.isAuthenticating,
      isAuthenticated: userSelector.isAuthenticated,
    }
  })
}

export function useAuthUserFetch() {
  const dispatch = useThunkDispatch()
  return useCallback(() => dispatch(getUserAction()), [dispatch])
}

export function useAuthUser() {
  return {
    ...useAuthUserState(),
    fetchUser: useAuthUserFetch(),
  }
}

export function AuthUserProvider({
  children = null,
}: {
  children:
    | React.ReactNode
    | ((props: { wait: boolean; user?: IUser }) => React.ReactNode)
}) {
  const { user, wait, isAuthenticating, fetchUser: getUser } = useAuthUser()
  useEffect(() => {
    if (!user && !isAuthenticating) {
      getUser()
    }
  }, [getUser])
  return (
    <Fragment>
      {typeof children === "function" ? children({ wait, user }) : children}
    </Fragment>
  )
}

/**
 * Redirects the user if the user is not authenticated
 *
 * Use this component to redirect the user to login from protected routes
 */
export function RedirectUnlessAuthenticated({
  children = null,
}: {
  children?: React.ReactNode
}) {
  const { wait, user } = useAuthUser()
  if (wait) {
    return null
  }
  if (!user) {
    return (
      <Location>
        {({ location }) => (
          <Redirect to={`/login?next=${location.pathname}`} noThrow />
        )}
      </Location>
    )
  }
  return <Fragment>{children}</Fragment>
}

/**
 * Redirects the user if the user is authenticated
 *
 * This is used to prevent users from navigate to routes that
 * should not be accessed when user is logged in e.g.
 * login, forgot password etc
 */
export function RedirectIfAuthenticated({
  children = null,
  to = "/",
}: {
  children?: React.ReactNode
  to?: string
}) {
  const { wait, user } = useAuthUser()
  if (wait) {
    return null
  }
  if (user) {
    return <Redirect to={to} noThrow />
  }
  return <Fragment>{children}</Fragment>
}
