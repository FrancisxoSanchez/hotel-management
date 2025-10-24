"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
// Importamos el tipo 'User' de tu archivo de tipos, pero
// lo usaremos para definir nuestro 'SessionUser' sin contraseña.
import type { User as AppUserType } from "./types";

// Este será el tipo de usuario que manejamos en el frontend.
// ¡Nunca debe incluir la contraseña!
type SessionUser = Omit<AppUserType, "password">;

interface AuthContextType {
  user: SessionUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (
    email: string,
    password: string,
    name: string,
    phone?: string
  ) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Revisar si el usuario está logueado (desde localStorage)
    try {
      const storedUser = localStorage.getItem("hotel_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser) as SessionUser);
      }
    } catch (error) {
      console.error("Error al parsear usuario de localStorage:", error);
      localStorage.removeItem("hotel_user");
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        // El servidor respondió con un error (ej: 401 Credenciales inválidas)
        return false;
      }

      const { user }: { user: SessionUser } = await response.json();

      if (user) {
        setUser(user);
        localStorage.setItem("hotel_user", JSON.stringify(user));
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error al intentar iniciar sesión:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("hotel_user");
    // Opcional: Redirigir al login
    // window.location.href = "/login";
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    phone?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name, phone }),
      });

      if (!response.ok) {
        // El servidor respondió con un error (ej: 409 Email en uso)
        return false;
      }

      const { user }: { user: SessionUser } = await response.json();

      if (user) {
        setUser(user);
        localStorage.setItem("hotel_user", JSON.stringify(user));
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error al intentar registrarse:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
