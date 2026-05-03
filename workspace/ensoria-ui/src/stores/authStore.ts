import { create } from 'zustand'
import { post, get, setToken, removeToken, getStoredToken } from '../lib/api'

export interface User {
  id: string
  email: string
  name: string
  role: string
  createdAt?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: getStoredToken(),
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const data = await post<{ user: User; token: string }>('/auth/login', { email, password })
    setToken(data.token)
    set({ user: data.user, token: data.token, isAuthenticated: true })
  },

  register: async (email, password, name) => {
    const data = await post<{ user: User; token: string }>('/auth/register', { email, password, name })
    setToken(data.token)
    set({ user: data.user, token: data.token, isAuthenticated: true })
  },

  logout: () => {
    removeToken()
    set({ user: null, token: null, isAuthenticated: false })
  },

  checkAuth: async () => {
    const token = getStoredToken()
    if (!token) {
      set({ isLoading: false, isAuthenticated: false })
      return
    }
    try {
      const resp = await get<{ user: User }>('/auth/me')
      set({ user: resp.user, token, isAuthenticated: true, isLoading: false })
    } catch {
      removeToken()
      set({ user: null, token: null, isAuthenticated: false, isLoading: false })
    }
  },
}))
