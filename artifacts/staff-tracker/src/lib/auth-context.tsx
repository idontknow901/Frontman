import { useSyncExternalStore } from "react";

const ADMIN_PASSWORD = "Modilovesmamta";
const STORAGE_KEY = "staff-tracker-admin";
const CHANGE_EVENT = "rpb-admin-state";

function getSnapshot(): boolean {
  return localStorage.getItem(STORAGE_KEY) === "granted";
}

function subscribe(callback: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function dispatch() {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useAuth() {
  const isAdmin = useSyncExternalStore(subscribe, getSnapshot);

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, "granted");
      dispatch();
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    dispatch();
  };

  return { isAdmin, login, logout };
}
