import axios, { AxiosError, HeadersDefaults } from "axios";
import { parseCookies } from "nookies";

const { "nextauth.token": token } = parseCookies();

export const api = axios.create({
  baseURL: "http://localhost:3333",
  headers: {
    Authorization: `Bearer ${token}`,
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
      } else {
        // logout
      }
    }
  }
);
