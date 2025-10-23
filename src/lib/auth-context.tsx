"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "./types"
import { mockUsers } from "./mock-data"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (email: string, password: string, name: string, phone?: string) => Promise<boolean>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const storedUser = localStorage.getItem("hotel_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication
    const foundUser = mockUsers.find((u) => u.email === email && u.password === password)

    if (foundUser) {
      setUser(foundUser)
      localStorage.setItem("hotel_user", JSON.stringify(foundUser))
      return true
    }

    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("hotel_user")
  }

  const register = async (email: string, password: string, name: string, phone?: string): Promise<boolean> => {
    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === email)
    if (existingUser) {
      return false
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      email,
      password,
      role: "cliente",
      name,
      phone,
      createdAt: new Date(),
    }

    mockUsers.push(newUser)
    setUser(newUser)
    localStorage.setItem("hotel_user", JSON.stringify(newUser))
    return true
  }

  return <AuthContext.Provider value={{ user, login, logout, register, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
