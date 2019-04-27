import React, { Fragment } from "react"

export interface ListProps {
  isFetching: boolean
  total: number
  items?: any[]
  render?: (items?: any[]) => React.ReactNode
  children?: React.ReactNode
}
export function List({
  isFetching,
  total,
  items,
  render,
  children,
}: ListProps) {
  return (
    <Fragment>
      {isFetching ? (
        <div className="text--center">Loading...</div>
      ) : total === 0 ? (
        <div className="text--center">No item in the list</div>
      ) : children ? (
        children
      ) : render ? (
        render(items)
      ) : null}
    </Fragment>
  )
}
