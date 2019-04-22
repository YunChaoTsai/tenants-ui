export interface IEmail<TEmailable> {
  id: number
  email: string
  is_primary: boolean
  emailable: TEmailable
}

export interface IPhoneNumber<TCallable> {
  id: number
  number: number
  country_dial_code_id: number
  is_primary: boolean
  callable: TCallable
  phone_number: string // number with dial_code appended to the number
}

export interface IContact {
  id: number
  name: string
  email?: string
  phone_number?: string
  emails: IEmail<IContact>[]
  phone_numbers: IPhoneNumber<IContact>[]
  primary_email: IEmail<IContact>
  primary_phone_number: IPhoneNumber<IContact>
}
