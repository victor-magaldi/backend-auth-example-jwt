import React, { createContext, ReactNode, useState } from "react";
import { api } from "../services/api";

type User = {
  email: string;
  permissions: string[];
  roles: string[];
};
type SignInCredentials = {
  email: string;
  password: string;
};
type AuthContextData = {
  signIn(crendentials: SignInCredentials): Promise<void>;
  isAutenticated: boolean;
};
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>();
  const isAutenticated = false;

  async function signIn({ email, password }: SignInCredentials) {
    console.log("entrou ", email, password);
    try {
      const reponse = await api.post("sessions", {
        email,
        password,
      });

      const { permissions, roles } = reponse.data;
      setUser({
        email,
        permissions,
        roles,
      });
    } catch (e) {
      console.log("error: ", e);
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, isAutenticated }}>
      {children}
    </AuthContext.Provider>
  );
}
