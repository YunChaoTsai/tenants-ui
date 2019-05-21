import React, { useState, useEffect, useRef } from "react"
import { Omit } from "utility-types"

import { contains } from "../dom-helpers"
import "./select.css"

export interface SelectProps {
  multiple?: boolean
  name?: string
  onChange: (value: any[] | any, name: string) => void
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
  fetchOnMount?: boolean
}

export function Select({
  multiple,
  name: propName,
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
  fetchOnMount,
}: SelectProps) {
  const name: string = propName || (multiple ? "select[]" : "select")
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
  const groupRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, changeFocusState] = useState<boolean>(false)
  useEffect(() => {
    if (fetchOnMount) {
      onQuery(query || "")
    }
  }, [])
  function setIsFouced(isFocused: boolean) {
    changeFocusState(isFocused)
    if (!isFocused) {
      onBlur && onBlur({ target: { name } })
    }
  }
  useEffect(() => {
    function handleClick(e: any) {
      if (groupRef.current) {
        const container = groupRef.current
        if (contains(container, e.target)) {
          if (!isFocused) {
            setIsFouced(true)
          }
        } else if (isFocused) {
          setIsFouced(false)
        }
      }
    }
    document.addEventListener("click", handleClick)
    document.addEventListener("keyup", handleClick)
    return () => {
      document.removeEventListener("click", handleClick)
      document.removeEventListener("keyup", handleClick)
    }
  }, [isFocused])
  function handleChange(option: any, checked: boolean) {
    const newValues = checked
      ? Array.isArray(value)
        ? value.concat([option])
        : option
      : Array.isArray(value)
      ? value.filter(v => v.id !== option.id)
      : undefined
    onChange(newValues, name)
    if (!multiple && newValues) {
      setTimeout(() => {
        setIsFouced(false)
      })
    }
  }
  return (
    <div className="select" data-focused={isFocused}>
      <div role="group" ref={groupRef}>
        {label ? <label htmlFor={name}>{label}</label> : null}
        <input
          type="search"
          value={
            isFocused ? query : !multiple && value ? value[labelKey] : query
          }
          onChange={e => {
            onQuery(e.target.value)
          }}
          id={name}
          onFocus={onFocus}
          required={required}
          readOnly={!searchable}
          placeholder={placeholder}
          aria-haspopup={true}
          aria-autocomplete={searchable ? "inline" : "list"}
          autoComplete="off"
          ref={inputRef}
        />
        <ol role="listbox" aria-multiselectable={multiple}>
          {isFocused && options.length === 0 ? (
            <li role="option" aria-readonly={true}>
              Type to search...
            </li>
          ) : null}
          {options.map(option => {
            const checked = value
              ? Array.isArray(value)
                ? value.some(v => v.id === option.id)
                : value.id === option.id
              : false
            return (
              <li
                key={option.id}
                role="option"
                aria-selected={checked}
                title={option.title || option.description}
                tabIndex={-1}
                onClick={() => {
                  handleChange(option, !checked)
                }}
              >
                {option[labelKey]}
              </li>
            )
          })}
        </ol>
      </div>
      {value && Array.isArray(value) ? (
        <ul className="selected-list">
          {value.map(v => (
            <li
              key={v.id}
              title="Click to unselect"
              role="button"
              onClick={() =>
                onChange(value.filter((val: any) => val.id !== v.id), name)
              }
            >
              {v[labelKey]}
            </li>
          ))}
        </ul>
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
