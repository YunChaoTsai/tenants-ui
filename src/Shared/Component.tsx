import React, { useState } from "react"

export interface ComponentProps<
  TState,
  TChildProps = { state: TState; setState: (state: TState) => void }
> {
  initialState: TState
  children?: React.ReactNode | ((props: TChildProps) => React.ReactNode)
  render?: (props: TChildProps) => React.ReactNode
}

export default function Component<TState>({
  initialState,
  render,
  children,
}: ComponentProps<TState>) {
  const [state, setState] = useState<TState>(initialState)
  const childProps = {
    state,
    setState,
  }
  return render
    ? render(childProps)
    : typeof children === "function"
    ? children(childProps)
    : children || null
}
