import React from "react"
import Button from "@tourepedia/button"

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
    <span>
      {from}-{to} of {total}{" "}
      <Button
        disabled={isFetching || currentPage <= 1}
        onClick={() => onChange(currentPage - 1)}
      >
        &lt;
      </Button>
      <Button disabled={isFetching} onClick={() => onChange(currentPage)}>
        &#8635;
      </Button>
      <Button
        disabled={isFetching || lastPage <= currentPage}
        onClick={() => onChange(currentPage + 1)}
      >
        &gt;
      </Button>
    </span>
  )
}

export default Paginate
