import React from "react"
import { AsyncSelect } from "@tourepedia/ui"
import { withXHR, XHRProps } from "./../xhr"

type AsyncProps = React.ComponentProps<typeof AsyncSelect>

export const SelectHotelExtraServices = withXHR(
  function SelectHotelExtraServices({
    xhr,
    ...otherProps
  }: XHRProps & Omit<AsyncProps, "fetch">) {
    return (
      <AsyncSelect
        {...otherProps}
        fetch={q =>
          xhr
            .get("/hotel-extra-services", { params: { q } })
            .then(resp => resp.data.data)
        }
      />
    )
  }
)

export const SelectTransportExtraServices = withXHR(
  function SelectTransportExtraServices({
    xhr,
    ...otherProps
  }: XHRProps & Omit<AsyncProps, "fetch">) {
    return (
      <AsyncSelect
        {...otherProps}
        fetch={q =>
          xhr
            .get("/transport-extra-services", { params: { q } })
            .then(resp => resp.data.data)
        }
      />
    )
  }
)

export const SelectOtherExtraServices = withXHR(
  function SelectOtherExtraServices({
    xhr,
    ...otherProps
  }: XHRProps & Omit<AsyncProps, "fetch">) {
    return (
      <AsyncSelect
        {...otherProps}
        fetch={q =>
          xhr
            .get("/other-extra-services", { params: { q } })
            .then(resp => resp.data.data)
        }
      />
    )
  }
)
