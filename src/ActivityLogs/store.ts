export interface IActivityLog {
  id: number
  name: "quote_created" | "quote_given" | "trip_stage_change" | string
  description: string
  causer?: any
  subject?: any
  properties?: { [key: string]: any }
  created_at: string
}
