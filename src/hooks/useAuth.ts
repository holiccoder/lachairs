"use client";

import { useState, useEffect } from "react";

export interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
  email: string | null;
}

export function useAuth(): AuthState {
  const [auth, setAuth] = useState<AuthState>({
    isLoggedIn: false,
    token: null,
    email: null,
  });

  useEffect(() => {
    const read = () => {
      const token = localStorage.getItem("customer_token");
      const email = localStorage.getItem("customer_email");
      setAuth({
        isLoggedIn: !!token,
        token,
        email,
      });
    };
    read();
    window.addEventListener("storage", read);
    return () => window.removeEventListener("storage", read);
  }, []);

  return auth;
}
