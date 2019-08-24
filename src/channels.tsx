import React, { useEffect, useState, useMemo } from "react"
import Echo from "laravel-echo"
import Pusher from "pusher-js"
import { $PropertyType } from "utility-types"

import { getAuthorizationToken } from "./xhr"
import config from "./config"
import { withContext } from "./utils"
import { useAuthUser } from "./Auth"

export function getChannels() {
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
  return channels
}

/**
 * Context for Channels
 *
 * Usage: Wrap a component with withXHR (dont forget to extends the XHRProps in the swapped components)
 */
export const ChannelContext = React.createContext<Echo | undefined>(undefined)
export const withChannels = withContext<Echo | undefined, "channels">(
  ChannelContext,
  "channels"
)
export type ChannelProps = { channels: Echo | undefined }

/**
 * Channel Context Provider
 */
export function ChannelContextProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuthUser()
  const [channels, setChannels] = useState<
    $PropertyType<ChannelProps, "channels">
  >(undefined)
  useEffect(() => {
    if (user) {
      setChannels(getChannels())
    }
  }, [user])
  return (
    <ChannelContext.Provider value={channels}>
      {children}
    </ChannelContext.Provider>
  )
}

/**
 * Hook to use the channels provided via context
 */
export function useChannels() {
  const channels = React.useContext(ChannelContext)
  return channels
}
