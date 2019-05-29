export interface IInstalment {
  id: number
  amount: number
  due_date: string
  paid_amount: number
  due_amount: number
  payment_id: number
  transactions: ITransaction[]
}

export interface ITransaction {
  id: number
  instalment_id: number
  amount: number
  is_credited: boolean
  payment_mode: string
  comments: string
  instalment?: IInstalment
  date: string
}

export interface IPayment<TPaymentable> {
  id: number
  amount: number
  is_credit: boolean
  comments: string
  paymentable: TPaymentable
  instalments: IInstalment[]
  transactions: ITransaction[]
}
