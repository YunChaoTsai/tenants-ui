import qs from "qs"
import React, { Context } from "react"
import { Subtract, Diff } from "utility-types"

export function searchToQuery(
  search: string = "?",
  options: { [key: string]: any } = {}
): { [key: string]: any } {
  return qs.parse(search, { ignoreQueryPrefix: true, ...options })
}

export function queryToSearch(
  query: any = {},
  options: { [key: string]: any } = {}
): string {
  return qs.stringify(query, { addQueryPrefix: true, ...options })
}

/**
 * High order component to reduce the context hoc boilerplate
 *
 * @params React.createContext
 * @params key for context access
 *
 * @return function (
 *  @params React.ComponentType which required the context
 *
 *  @return React.ComponentType which can be rendered and will render the Wrapped component with context along with
 *  passed props
 * )
 *
 * Usage:
 * type Theme =  "dark" | "light"
 * const ThemeContext = React.createContext<Theme>("dark")
 * const withThemeContext = withContext<Theme>(ThemeContext, "theme")
 * type ThemeProps = { theme: Theme }
 *
 * ... late in app
 *
 * type ButtonProps = ThemeProps & { disabled?: boolean }
 * const Button = ({ theme, ...otherProps }: ButtonProps) => <button className={theme} {...otherProps} />
 * export default withThemeContext(Button)
 */
export function withContext<BaseContext, Key extends string>(
  ContextProvider: Context<BaseContext>,
  key: Key
) {
  // this is a hacky way to typehint the key as string
  type Keys = Key | Key
  type InjectedProps = { [key in Keys]: BaseContext }
  return function connectWithContext<BaseProps extends InjectedProps>(
    BaseComponent: React.ComponentType<BaseProps>
  ) {
    // return a component that requires (BaseProps -  InjectedProps)
    function Connected(props: Subtract<BaseProps, InjectedProps>) {
      return (
        <ContextProvider.Consumer>
          {value => {
            const newProps = {
              [key]: value,
              ...(props as BaseProps),
            }
            return <BaseComponent {...newProps} />
          }}
        </ContextProvider.Consumer>
      )
    }
    // Wrapped component can be accessed as static property
    Connected.WrappedComponent = BaseComponent
    // some react dev tools stuff for better debugging
    const wrappedCompName =
      BaseComponent.displayName || BaseComponent.name || "Component"
    const consumerName = ContextProvider.Consumer.name || "Context.Consumer"
    Connected.displayName =
      wrappedCompName + "(" + consumerName + "." + key + ")"
    return Connected
  }
}

/**
 * Get the props of any tag (HTML Tag, React Component)
 */
export type PropsOf<
  Tag extends React.ReactType
> = Tag extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[Tag]
  : Tag extends React.SFC<infer Props>
  ? Props & React.Attributes
  : Tag extends React.ComponentClass<infer Props2>
  ? (Tag extends new (...args: any[]) => infer Instance
      ? Props2 & React.ClassAttributes<Instance>
      : never)
  : never

/**
 * OverwriteAssign
 *
 * Overwrite props in `To` by `By` props
 * @example
 *
 *  // Expect: { name: string, email: number, phone: number }
 *  OverwriteAssign<{ name: string, email: string }, { email: number, phone: number }>
 */
export type OverwriteAssign<
  To extends React.ReactType,
  By extends object = {}
> = Diff<PropsOf<To>, By> & By

export type AsProp<
  As extends React.ReactType,
  P extends object = {}
> = OverwriteAssign<As, { as?: As } & P>
