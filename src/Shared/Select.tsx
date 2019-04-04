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
}: SelectProps) {
  name = name || (multiple ? "select[]" : "select")
  value = value || (multiple ? [] : undefined)
  return (
    <div>
      {label ? <label>{label}</label> : null}
      {searchable ? (
        <input
          value={query}
          onChange={e => {
            onQuery(e.target.value)
          }}
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
                {option.name}
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
