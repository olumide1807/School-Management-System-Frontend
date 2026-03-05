import { jwtDecode } from "jwt-decode";

export const getTokenExpirationTime = (token: string) => {
  if (!token) return null;

  const decodedToken = jwtDecode(token);
  if (!decodedToken.exp) return null;

  return decodedToken.exp * 1000;
};
