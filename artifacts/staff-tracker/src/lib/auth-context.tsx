import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { StaffMemberAccessLevel } from "@workspace/api-client-react";

type AuthContextType = {
  role: StaffMemberAccessLevel;
  setRole: (role: StaffMemberAccessLevel) => void;
  canIssueWarning: boolean;
  canAddStaff: boolean;
  canEditStats: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<StaffMemberAccessLevel>(() => {
    const saved = localStorage.getItem("staff-tracker-role");
    if (saved && Object.values(StaffMemberAccessLevel).includes(saved as StaffMemberAccessLevel)) {
      return saved as StaffMemberAccessLevel;
    }
    return StaffMemberAccessLevel.HQ;
  });

  useEffect(() => {
    localStorage.setItem("staff-tracker-role", role);
  }, [role]);

  const canAddStaff = role === StaffMemberAccessLevel.HQ || role === StaffMemberAccessLevel.Director;
  const canIssueWarning = role === StaffMemberAccessLevel.HQ || role === StaffMemberAccessLevel.Director; // HQ/Dir can issue any. AD handles strikes elsewhere.
  const canEditStats = role === StaffMemberAccessLevel.HQ || role === StaffMemberAccessLevel.Director || role === StaffMemberAccessLevel.Assistant_Director;

  return (
    <AuthContext.Provider value={{ role, setRole: setRoleState, canIssueWarning, canAddStaff, canEditStats }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
