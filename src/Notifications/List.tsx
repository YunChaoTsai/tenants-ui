import React, { useCallback } from "react"
import { AxiosInstance } from "axios"
import { Link } from "@reach/router"
import classNames from "classnames"
import { Badge, Icons } from "@tourepedia/ui"
import moment from "moment"
import { useSelector } from "react-redux"

import { INotification, actions, IStateWithKey, selectors } from "./store"
import { ThunkAction } from "./../types"
import { IPaginate } from "../model"
import { useThunkDispatch } from "../utils"
import { notificationsChannel } from "../channels"
import { store as authStore } from "./../Auth"

export function XHR(xhr: AxiosInstance) {
  return {
    async getNotifications(
      params?: any
    ): Promise<{ data: INotification[]; meta: any }> {
      return xhr.get("/notifications", { params }).then(resp => resp.data)
    },
    async markAsRead(
      items: Array<INotification>
    ): Promise<{ data: INotification[] }> {
      return xhr.patch("/notifications/mark-as-read", {
        items: items.map(n => n.id),
      })
    },
  }
}

export const getNotificationsAction = (
  params?: any
): ThunkAction<Promise<INotification[]>> => async (
  dispatch,
  getState,
  { xhr }
) => {
  dispatch(actions.list.request())
  return XHR(xhr)
    .getNotifications(params)
    .then(({ data, meta }) => {
      dispatch(actions.list.success({ data, meta }))
      const user = authStore.selectors(getState()).user
      if (user) {
        notificationsChannel(user.id).notification(
          (notification: INotification) => {
            const notifications = selectors(getState()).get()
            dispatch(
              actions.list.success({
                data: [
                  {
                    ...notification,
                    data:
                      typeof notification.data === "string"
                        ? JSON.parse(notification.data)
                        : notification.data,
                  },
                  ...notifications,
                ],
                meta,
              })
            )
          }
        )
      }
      return data
    })
    .catch(error => {
      dispatch(actions.list.failure(error))
      return Promise.reject(error)
    })
}

export const markNotificationAsReadAction = (
  notifications: Array<INotification>
): ThunkAction<Promise<INotification[]>> => async (dispatch, _, { xhr }) => {
  const afterRead = {
    data: notifications.map(i => ({
      ...i,
      read_at: moment.utc().toString(),
    })),
  }
  dispatch(actions.markAsRead.success(afterRead))
  return XHR(xhr)
    .markAsRead(notifications)
    .then(({ data }) => {
      return data
    })
    .catch(error => {
      // revert the change
      const afterRead = {
        data: notifications.map(i => ({
          ...i,
          read_at: null,
        })),
      }
      dispatch(actions.markAsRead.success(afterRead))
      return Promise.reject(error)
    })
}

function useNotificationsState() {
  interface StateProps extends IPaginate {
    notifications: INotification[]
    isFetching: boolean
  }
  return useSelector<IStateWithKey, StateProps>(state => {
    const notificationsSelector = selectors(state)
    return {
      ...notificationsSelector.meta,
      isFetching: notificationsSelector.isFetching,
      notifications: notificationsSelector.get(),
    }
  })
}

function useNotificationsFetch() {
  const dispatch = useThunkDispatch()
  return useCallback(
    (params?: any) => dispatch(getNotificationsAction(params)),
    [dispatch]
  )
}

function useMarkNotificationsAsRead() {
  const dispatch = useThunkDispatch()
  return useCallback(
    (data: Array<INotification>) =>
      dispatch(markNotificationAsReadAction(data)),
    [dispatch]
  )
}

function useAllMarkNotificationsAsRead() {
  const dispatch = useThunkDispatch()
  const { notifications } = useNotificationsState()
  return useCallback(
    () =>
      dispatch(
        markNotificationAsReadAction(notifications.filter(n => !n.read_at))
      ),
    [dispatch, notifications]
  )
}

export function useNotifications() {
  return {
    ...useNotificationsState(),
    fetchNotifications: useNotificationsFetch(),
    markAllAsRead: useAllMarkNotificationsAsRead(),
  }
}

function TripConverted({ notification }: { notification: INotification }) {
  const { data } = notification
  const { id, price, converted_by } = data
  return (
    <div>
      <div>
        <div className="font-bold mb-1">
          <Link to={`/trips/${id}`}>Trip Conversion</Link>
        </div>
        <div className="text-sm">
          <Badge>
            <Icons.RupeeIcon /> {price}
          </Badge>{" "}
          by {converted_by}
        </div>
      </div>
    </div>
  )
}

export function Notification({
  notification,
}: {
  notification: INotification
}) {
  const { created_at, read_at } = notification
  const markAsRead = useMarkNotificationsAsRead()

  // content of the notification
  let Text: React.ComponentType<{ notification: INotification }>
  switch (notification.type) {
    case "App\\Notifications\\TripConverted":
      Text = TripConverted
      break
    default:
      console.warn(`No renderer for '${notification.type}' type notification`)
      return null
  }
  return (
    <div
      className={classNames("p-3", {
        "bg-gray-100": read_at,
      })}
    >
      <Text notification={notification} />
      <footer className="mt-1 text-sm text-gray-600">
        {moment
          .utc(created_at)
          .local()
          .fromNow()}{" "}
        •{" "}
        {read_at ? (
          <span>Read</span>
        ) : (
          <button
            className="text-primary-600"
            onClick={() => markAsRead([notification])}
          >
            <Icons.OkIcon title="Mark as Read" />
          </button>
        )}
      </footer>
    </div>
  )
}
