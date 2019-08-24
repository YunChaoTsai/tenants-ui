import Echo from "laravel-echo"
import Pusher from "pusher-js"

import { getAuthorizationToken } from "./xhr"
import config from "./config"

const client = new Pusher(config.pusher.key, {
  cluster: config.pusher.cluster,
  forceTLS: true,
  authEndpoint: config.pusher.authEndpoint,
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
