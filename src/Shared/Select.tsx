import React, { useState, Fragment } from "react"

interface SelectProps {
  multiple?: boolean
  name?: string
  onChange: (value?: any[] | any) => void
  onQuery: (query: string) => void
  options?: any[]
  placeholder?: string
  query?: string
  value?: any | any[]
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
}: SelectProps) {
  name = name || (multiple ? "select[]" : "select")
  return (
    <Fragment>
      <input
        value={query}
        onChange={e => {
          onQuery(e.target.value)
        }}
        placeholder={placeholder}
      />
      {options.length ? (
        <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {options.map(option => (
            <li key={option.id} style={{ display: "inline-block" }}>
              <label>
                <input
                  type={multiple ? "checkbox" : "radio"}
                  name={name}
                  value={JSON.stringify(option)}
                  checked={
                    Array.isArray(value)
                      ? value.some(v => v.id === option.id)
                      : value.id === option.id
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
    </Fragment>
  )
}

export default Select
