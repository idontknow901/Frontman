import { createContext, useContext, ReactNode } from "react";

type AuthContextType = {
  role: "HQ";
  canIssueWarning: true;
  canAddStaff: true;
  canEditStats: true;
};

const AuthContext = createContext<AuthContextType>({
  role: "HQ",
  canIssueWarning: true,
  canAddStaff: true,
  canEditStats: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider value={{ role: "HQ", canIssueWarning: true, canAddStaff: true, canEditStats: true }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
