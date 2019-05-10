import React from "react"
import { Omit } from "utility-types"

import "./table.css"

export function Table({
  fixedLayout,
  className,
  headers,
  children,
  alignCols = {},
  rows,
  responsive,
  ...otherProps
}: Omit<React.HTMLProps<HTMLTableElement>, "headers" | "rows"> & {
  /**
   * Table has a fixed layout
   * @default false
   */
  fixedLayout?: boolean
  /**
   * Headers for the table
   * @default undefined
   */
  headers?: React.ReactNode[]
  /**
   * Rows in the table
   * @default undefined
   */
  rows?: React.ReactNode[][]
  /**
   * Align the columns on right or center. Pass the column number(index) as key and right | center as it's value in the object
   * @default undefined
   */
  alignCols?: { [key: number]: "center" | "right" }
  /**
   * Does the table requires responsiveness?
   * @default false
   */
  responsive?: boolean
}) {
  const $table = (
    <table
      className={`table ${fixedLayout ? "table--fixed" : ""} ${className}`}
      {...otherProps}
    >
      {headers ? (
        <thead>
          <tr>
            {headers.map((header, h) => (
              <th
                key={h}
                className={alignCols[h] ? "text--" + alignCols[h] : ""}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
      ) : null}
      {rows ? (
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((data, d) => (
                <td
                  key={d}
                  className={alignCols[d] ? "text--" + alignCols[d] : ""}
                >
                  {data}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      ) : null}
      {children}
    </table>
  )
  if (responsive) {
    return <div className="table-responsive">{$table}</div>
  }
  return $table
}
