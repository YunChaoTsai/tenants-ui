import React, { useState } from "react"
import { Subtract, Omit } from "utility-types"

export interface SelectProps {
  multiple?: boolean
  name?: string
  onChange: (value?: any[] | any) => void
  onQuery: (query: string) => void
  options?: any[]
  placeholder?: string
  query?: string
  value?: any | any[]
  label?: React.ReactNode
  searchable?: boolean
  creatable?: boolean
  onBlur?: (e: any) => void
  onFocus?: (e: any) => void
  required?: boolean
  labelKey?: string
}

export function Select({
  multiple,
  name,
  onChange,
  onQuery,
  options = [],
  placeholder = "Type to search...",
  query,
  value,
  label,
  searchable = true,
  creatable = false,
  onBlur,
  onFocus,
  required,
  labelKey = "name",
}: SelectProps) {
  name = name || (multiple ? "select[]" : "select")
  value = value || (multiple ? [] : undefined)
  if (value) {
    let moreOptions = []
    if (Array.isArray(value)) {
      moreOptions = value
    } else {
      moreOptions = [value]
    }
    // only push the more options if they are not already present in
    // the options list
    moreOptions = moreOptions.filter(
      moreOption => !options.some(option => option.id === moreOption.id)
    )
    options = options.concat(moreOptions)
  }
  if (creatable && options.length === 0 && query && query.trim()) {
    options = options.concat({
      id: query,
      name: query,
      created: true,
    })
  }
  return (
    <div>
      {label ? <label>{label}</label> : null}
      {searchable ? (
        <input
          value={query}
          onChange={e => {
            onQuery(e.target.value)
          }}
          onFocus={onFocus}
          onBlur={onBlur}
          required={required}
          placeholder={placeholder}
        />
      ) : null}
      {options.length ? (
        <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {options.map(option => (
            <li key={option.id} style={{ display: "inline-block" }}>
              <label title={option.title || option.description}>
                <input
                  type={multiple ? "checkbox" : "radio"}
                  name={name}
                  value={JSON.stringify(option)}
                  checked={
                    value
                      ? Array.isArray(value)
                        ? value.some(v => v.id === option.id)
                        : value.id === option.id
                      : false
                  }
                  onChange={e => {
                    onChange(
                      e.target.checked
                        ? Array.isArray(value)
                          ? value.concat([option])
                          : option
                        : Array.isArray(value)
                        ? value.filter(v => v.id !== option.id)
                        : undefined
                    )
                  }}
                />
                {option[labelKey]}
              </label>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  )
}

export interface AsyncProps
  extends Omit<SelectProps, "onQuery" | "options" | "query">,
    Partial<Pick<SelectProps, "onQuery" | "options" | "query">> {
  fetch: (query: string) => Promise<any[]>
}

export function Async({ fetch, ...otherProps }: AsyncProps) {
  const [query, setQuery] = useState<string>("")
  const [options, setOptions] = useState<any[]>([])
  return (
    <Select
      options={options}
      query={query}
      onQuery={query => {
        fetch(query).then(setOptions)
        setQuery(query)
      }}
      {...otherProps}
    />
  )
}
export default Select
