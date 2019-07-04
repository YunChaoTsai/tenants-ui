import React, { useEffect, useCallback } from "react"
import { RouteComponentProps } from "@reach/router"
import { AxiosInstance } from "axios"

import { ThunkAction } from "./../types"
import { actions } from "./store"
import { searchToQuery, useThunkDispatch } from "./../utils"

// actions
function XHR(xhr: AxiosInstance) {
  return {
    async logout(): Promise<any> {
      return xhr.delete("/logout").then(resp => {
        localStorage.removeItem("access_token")
        return resp
      })
    },
  }
}
export const logoutAction = (): ThunkAction<Promise<any>> => async (
  dispatch,
  _,
  { xhr }
) =>
  XHR(xhr)
    .logout()
    .then(() => {
      dispatch(actions.logout.success())
    })

function useLogout() {
  const dispatch = useThunkDispatch()
  return useCallback(() => dispatch(logoutAction()), [dispatch])
}

function Logout({ navigate, location }: RouteComponentProps) {
  // get the `from` query parameter from the logout props
  // and redirect back to `from` if present
  const query = searchToQuery(location && location.search)
  const from = query["from"]
  const logout = useLogout()
  useEffect(() => {
    logout().then(() => {
      navigate && navigate(from || "/")
    })
  }, [])
  return <div>Logging out</div>
}
export default Logout
