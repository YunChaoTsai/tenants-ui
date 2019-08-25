import { useAuthUser } from "."
import { useMemo } from "react"

export const PERMISSIONS = {
  MANAGE_ROLES: "manage_roles",
  MANAGE_TENANTS: "manage_tenants",
  MANAGE_TRIP_OWNERS: "manage_trip_owners",
  MANAGE_TRIP_PLAN_REQUESTS: "manage_trip_plan_requests",
  MANAGE_USERS: "manage_users",
  VIEW_TRIP_PLAN_REQUESTS: "view_trip_plan_requests",
}

export function useCheckPermissions() {
  const { user } = useAuthUser()
  const permissionsByName = useMemo<{ [key: string]: string }>(() => {
    if (!user) return {}
    const { permissions } = user
    return permissions.reduce(
      (byName: { [key: string]: string }, permission) => {
        byName[permission] = permission
        return byName
      },
      {}
    )
  }, [user])
  return {
    /**
     * Check if the user has all the required permissions
     */
    hasPermission(...permissions: Array<string>): Boolean {
      if (typeof permissions === "string") {
        permissions = [permissions]
      }
      return permissions.every(permission => permissionsByName[permission])
    },
    /**
     * Check if the user has any of the checked permissions
     */
    hasAnyPermission(...permissions: Array<string>): Boolean {
      return permissions.some(permission => permissionsByName[permission])
    },
  }
}
