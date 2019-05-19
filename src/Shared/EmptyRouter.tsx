import React from "react"
import { RouteComponentProps } from "@reach/router"

export default function EmptyRouter({
  render,
  ...routeComponentProps
}: RouteComponentProps & {
  render: (props: RouteComponentProps) => React.ReactNode
}) {
  return <>{render(routeComponentProps)}</>
}
