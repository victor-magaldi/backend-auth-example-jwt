import Router from "next/router";
import React, { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/api";
import { setCookie, parseCookies } from "nookies";
import { HeadersDefaults } from "axios";
interface CommonHeaderProperties extends HeadersDefaults {
  Authorization: string;
}
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
  user: User | undefined;
};
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>();
  const isAutenticated = !!user;

  useEffect(() => {
    const { "nextauth.token": token } = parseCookies();
    if (token) {
      api.get("/me").then((response) => {
        const { email, permissions, roles } = response.data;

        setUser({ email, permissions, roles });
      });
    }
  }, []);

  async function signIn({ email, password }: SignInCredentials) {
    try {
      const reponse = await api.post("sessions", {
        email,
        password,
      });

      const { token, refreshToken, permissions, roles } = reponse.data;

      setCookie(undefined, "nextauth.token", token, {
        maxAge: 30 * 60 * 24 * 30, // 30 days
        path: "/",
      });
      setCookie(undefined, "nextauth.refreshToken", refreshToken, {
        maxAge: 30 * 60 * 24 * 30, // 30 days
        path: "/",
      });

      setUser({
        email,
        permissions,
        roles,
      });

      if (api.defaults?.headers && api.defaults.headers.common) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
      Router.push("/dashboard");
    } catch (e) {
      console.log("error: ", e);
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, isAutenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
}
