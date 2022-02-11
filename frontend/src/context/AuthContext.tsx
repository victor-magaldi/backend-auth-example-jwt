import React, { createContext, FunctionComponent, ReactNode } from "react";
import { api } from "../services/api";

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
  const isAutenticated = false;

  async function signIn({ email, password }: SignInCredentials) {
    console.log("entrou ", email, password);
    try {
      const reponse = await api.post("sessions", {
        email,
        password,
      });
      console.log("opa", reponse.data);
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
