import React from "react"
import { XHRProps, withXHR } from "../xhr"
import { AsyncProps } from "@tourepedia/select"
import { AsyncSelect } from "@tourepedia/ui"
import { AxiosInstance } from "axios"
import { ITag } from "./store"

export function XHR(xhr: AxiosInstance, type: string) {
  return {
    async getTags(params?: any): Promise<{ data: Array<ITag> }> {
      return xhr.get(`/${type}-tags`, { params }).then(resp => resp.data)
    },
    async storeTags(
      items: Array<number>,
      tags: Array<string>
    ): Promise<{ data: Array<any> }> {
      return xhr.post(`/${type}-tags`, { items, tags }).then(resp => resp.data)
    },
  }
}

interface SelectTagsProps extends XHRProps, Omit<AsyncProps, "fetch"> {
  type: "trip"
}

export const SelectTags = withXHR(function SelectRoomTypes({
  xhr,
  type,
  ...otherProps
}: SelectTagsProps) {
  return (
    <AsyncSelect
      multiple
      creatable
      {...otherProps}
      fetch={q =>
        XHR(xhr, type)
          .getTags({ q })
          .then(resp => resp.data)
      }
    />
  )
})
