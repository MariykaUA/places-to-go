export interface Place {
  id: string
  name: string
  image: string
  address: string
  liked: boolean | null
  type: string
  notes: string
  visitors: string[]
  createdAt: string
}
