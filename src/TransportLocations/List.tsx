import React from "react"
import { XHRProps, withXHR } from "../xhr"
import { AsyncProps } from "@tourepedia/select"
import { AsyncSelect } from "@tourepedia/ui"
import { AxiosInstance } from "axios"
import { ITransportLocation } from "./store"

export function XHR(xhr: AxiosInstance) {
  return {
    async getTransportLocations(
      params?: any
    ): Promise<{ data: Array<ITransportLocation> }> {
      return xhr.get(`/transport-locations`, { params }).then(resp => resp.data)
    },
  }
}

interface SelectProps extends XHRProps, Omit<AsyncProps, "fetch"> {}

export const SelectTransportLocations = withXHR(
  function SelectTransportLocations({ xhr, ...otherProps }: SelectProps) {
    return (
      <AsyncSelect
        multiple
        creatable
        {...otherProps}
        fetch={q =>
          XHR(xhr)
            .getTransportLocations({ q })
            .then(resp => resp.data)
        }
      />
    )
  }
)
