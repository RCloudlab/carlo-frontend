import { api } from './api'

export interface Catequista {
  id: string
  full_name: string
  email: string
  is_active: boolean
  created_at: string | null
}

export interface CatequistaList {
  items: Catequista[]
  total: number
}

export interface CatequistaCreate {
  full_name: string
  email: string
}

export async function listCatequistas(): Promise<CatequistaList> {
  const { data } = await api.get<CatequistaList>('/users/catequistas')
  return data
}

export async function createCatequista(payload: CatequistaCreate): Promise<Catequista> {
  const { data } = await api.post<Catequista>('/users/catequistas', payload)
  return data
}

export async function deactivateCatequista(id: string): Promise<Catequista> {
  const { data } = await api.delete<Catequista>(`/users/catequistas/${id}`)
  return data
}
