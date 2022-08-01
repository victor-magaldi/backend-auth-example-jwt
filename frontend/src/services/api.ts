import axios, { AxiosError, AxiosRequestConfig, HeadersDefaults } from "axios";
import { parseCookies, setCookie } from "nookies";

interface CommonHeaderProperties extends HeadersDefaults {
  Authorization: string;
}

let cookies = parseCookies();
let isRefreshing = false;
let failedRequestQueue = [];

export const api = axios.create({
  baseURL: "http://localhost:3333",
  headers: {
    Authorization: `Bearer ${cookies?.["nextauth.token"]}`,
  },
});

api.interceptors.response.use(
  (response) => {
    // primeiro parametro , resposta sucesso
    return response;
  },
  (error: AxiosError) => {
    // primeiro parametro , resposta sucesso

    if (error.response?.status === 401) {
      if (error.response?.data?.code === "token.expired") {
        //renovar token
        cookies = parseCookies();

        const { "nextauth.refreshToken": refreshToken } = cookies;
        const originalConfig = error.config as CommonHeaderProperties;

        if (!isRefreshing) {
          isRefreshing = true;
          api
            .post("/refresh", {
              refreshToken,
            })
            .then((response) => {
              const { token } = response.data;

              setCookie(undefined, "nextauth.token", token, {
                maxAge: 30 * 60 * 24 * 30, // 30 days
                path: "/",
              });
              setCookie(
                undefined,
                "nextauth.refreshToken",
                response.data.refreshToken,
                {
                  maxAge: 30 * 60 * 24 * 30, // 30 days
                  path: "/",
                }
              );
              if (api.defaults?.headers && api.defaults.headers.common) {
                api.defaults.headers.common[
                  "Authorization"
                ] = `Bearer ${token}`;
              }
            })
            .finally(() => {
              isRefreshing = false;
            });
        }

        return new Promise((resolve, reject) => {
          failedRequestQueue.push({
            onSuccess: (token: string) => {
              originalConfig["Authorization"] = `Bearer ${token}`;

              resolve(api(originalConfig as AxiosRequestConfig<any>));
            },
            onFailure: (err: AxiosError) => {
              reject(err);
            },
          });
        });
      } else {
        // logout
      }
    }
  }
);
