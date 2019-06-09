import React from "react"
import { Button, Icons } from "@tourepedia/ui"

export interface PaginateProps {
  total: number
  from: number
  to: number
  currentPage: number
  lastPage: number
  isFetching: boolean
}

export function Paginate({
  total,
  from,
  to,
  currentPage,
  isFetching,
  lastPage,
  onChange,
}: PaginateProps & {
  onChange: (page: number) => any
}) {
  return (
    <span style={{ marginBottom: "1em", display: "inline-block" }}>
      {from}-{to} of {total}{" "}
      <span className="button-group">
        <Button
          disabled={isFetching || currentPage <= 1}
          onClick={() => onChange(currentPage - 1)}
        >
          <Icons.ChevronDownIcon className="rotate-90" />
        </Button>
        <Button disabled={isFetching} onClick={() => onChange(currentPage)}>
          <Icons.RefreshIcon />
        </Button>
        <Button
          disabled={isFetching || lastPage <= currentPage}
          onClick={() => onChange(currentPage + 1)}
        >
          <Icons.ChevronDownIcon className="rotate-270" />
        </Button>
      </span>
    </span>
  )
}

export default Paginate
