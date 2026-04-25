export interface Goal {
  id: string
  name: string
  target_amount: number
  current_amount: number
  deadline: string | null
  user_id: string
}
