import Echo from "laravel-echo"
import Pusher from "pusher-js"

import { getAuthorizationToken } from "./xhr"

const client = new Pusher(process.env.REACT_APP_PUSHER_APP_KEY, {
  cluster: process.env.REACT_APP_PUSHER_APP_CLUSTER,
  forceTLS: true,
  authEndpoint: "http://localhost:8000/broadcasting/auth",
  auth: {
    headers: {
      Authorization: `Bearer ${getAuthorizationToken()}`,
    },
  },
})

const channels = new Echo({
  broadcaster: "pusher",
  client: client,
})

export function notificationsChannel(userId: number) {
  return channels.private("users." + userId)
}

export default channels
