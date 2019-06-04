import React from "react"
import { Omit } from "utility-types"
import { AxiosInstance } from "axios"
import { ICountryDialCode } from "./store"

import { withXHR, XHRProps } from "./../xhr"
import { Async, AsyncProps } from "@tourepedia/select"
import * as store from "./store"

export function XHR(xhr: AxiosInstance) {
  return {
    getCountryDialCode(params?: any): Promise<ICountryDialCode[]> {
      return xhr
        .get("/country-dial-codes", { params })
        .then(resp => resp.data.data)
    },
  }
}

interface SelectCountryDialCodeProps
  extends XHRProps,
    Omit<AsyncProps, "fetch"> {}

export const SelectCountryDialCodes = withXHR<SelectCountryDialCodeProps>(
  function SelectCountryDialCodes({
    xhr,
    ...otherProps
  }: SelectCountryDialCodeProps) {
    return (
      <Async
        multiple={false}
        {...otherProps}
        fetch={q => XHR(xhr).getCountryDialCode({ q })}
      />
    )
  }
)

export { store }
