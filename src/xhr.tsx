import React from "react"
import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosInstance,
  AxiosError,
} from "axios"
import qs from "qs"
import { compose } from "redux"
import { withContext } from "./utils"

/**
 * Request interceptor for Authorization Header
 *
 * This interceptor is responsible for attaching the `Authorization` header for authenticated user to be
 * validated for auth restricted apis
 *
 * NOTE: Authorization header causes the pre-flight (OPTIONS) request
 * NOTE: We can also set this in the query params in the token key by which we can avoid the
 * pre-flight request, but this will make a REALLY LOOOONG URL
 */
function authorizationHeaderInterceptor(
  config: AxiosRequestConfig
): AxiosRequestConfig {
  config.headers["Authorization"] = `Bearer ${localStorage.getItem(
    "access_token"
  )}`
  return config
}

/**
 * Request interceptor for update the content type to x-www-form-urlencoded
 *
 * This interceptor will change the request content type to `x-ww-form-urlencoded` which is not the default in axios.
 * Axios's default is `application/json` which causes pre-flight request for CORS
 */
function contentTypeXWWWFormUrlencodedInterceptor(
  config: AxiosRequestConfig
): AxiosRequestConfig {
  const data = config.data
  const params = config.params
  config.headers["Content-Type"] = "application/x-www-form-urlencoded"
  // if it is already FormData, nothing is required
  if (data instanceof FormData) {
    return config
  }
  // else stringify the data and update it
  config.data = qs.stringify(data)
  config.url = config.url + qs.stringify(params, { addQueryPrefix: true })
  config.params = undefined
  return config
}

/**
 * Intercept the request to change the method type (put, patch, delete) to supported method type
 *
 * DELETE, PUT, PATCH methods are not support in the XHR requests, but our backend endpoints accept these method types.
 * Larave/Lumen request interceptors will resolve a request type via `_method` property in the request data,
 * i.e. delete, put and patch requests, we will send as a post request with `_method = delete | put | patch` key in the
 * request data
 */
function methodTypeInterceptor(config: AxiosRequestConfig) {
  const method = (config.method || "").toUpperCase()
  const data = config.data || {}
  switch (method) {
    case "DELETE":
    case "PATCH":
    case "PUT":
      if (data instanceof FormData) {
        data.append("_method", method)
      } else {
        data["_method"] = method
      }
      config.method = "POST"
  }
  config.data = data
  return config
}

/**
 * Intercept the authentication success request to get the token
 *
 * Check for access_token in the response and save it to local storage so that any after coming requests
 * can use the token to validate the authenticated user
 */
function accessTokenInterceptor(response: AxiosResponse): AxiosResponse {
  const { data } = response
  if (data.access_token) {
    localStorage.setItem("access_token", data.access_token)
  }
  return response
}

/**
 * Transform the error message
 *
 * Default error reponse is a long chain for accessing the error response data
 */
function errorTransformInterceptor(error: AxiosError): any {
  const e = error.response && error.response.data && error.response.data.error
  if (!e) {
    return Promise.reject(error)
  }
  if (e.errors) {
    const formikErrors = Object.keys(e.errors).reduce(
      (errors: { [key: string]: string }, name: string) => {
        errors[name] = e.errors[name].join(", ")
        return errors
      },
      {}
    )
    e.formikErrors = formikErrors
  }
  return Promise.reject(e)
}

/**
 * Base url for requests
 *
 * This is simply a helper for requests so that we don't have to use the env all over the places.
 * If in any case, we need to disabled this behaviour, we can write the
 * full uri (https://apis.tourepedia.com/login) instead of path (/login)
 */
axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL

// inject the interceptors for request and response
axios.interceptors.request.use(
  compose(
    authorizationHeaderInterceptor,
    contentTypeXWWWFormUrlencodedInterceptor,
    methodTypeInterceptor
  )
)
axios.interceptors.response.use(
  compose(accessTokenInterceptor),
  compose(errorTransformInterceptor)
)

/**
 * Context for XHR
 *
 * Usage: Wrap a component with withXHR (dont forget to extends the XHRProps in the swapped components)
 */
export const XHRContext = React.createContext<AxiosInstance>(axios)
export const withXHR = withContext<AxiosInstance, "xhr">(XHRContext, "xhr")
export type XHRProps = { xhr: AxiosInstance }

export default axios
