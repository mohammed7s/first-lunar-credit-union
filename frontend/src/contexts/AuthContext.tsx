import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAccount } from "wagmi";
import { db } from "@/lib/supabase";

interface User {
  id: string;
  wallet_address: string;
  wallet_type: 'obsidian' | 'metamask';
  name?: string;
}

interface Organization {
  id: string;
  name: string;
  owner_id: string;
  treasury_address: string;
  chain_id: number;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setOrganization: (org: Organization | null) => void;
  refreshUser: () => Promise<void>;
  refreshOrganization: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { address, isConnected } = useAccount();
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    if (!address) {
      setUser(null);
      return;
    }

    try {
      const { data } = await db.users.getByWallet(address.toLowerCase());
      setUser(data || null);
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    }
  };

  const refreshOrganization = async () => {
    if (!user) {
      setOrganization(null);
      return;
    }

    try {
      const { data } = await db.organizations.getByOwner(user.id);
      // Get the first organization for now (users can have multiple in the future)
      setOrganization(data && data.length > 0 ? data[0] : null);
    } catch (error) {
      console.error("Error fetching organization:", error);
      setOrganization(null);
    }
  };

  const logout = () => {
    setUser(null);
    setOrganization(null);
  };

  // Load user when wallet connects
  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      if (isConnected && address) {
        await refreshUser();
      } else {
        setUser(null);
        setOrganization(null);
      }
      setIsLoading(false);
    };

    loadUser();
  }, [address, isConnected]);

  // Load organization when user changes
  useEffect(() => {
    if (user) {
      refreshOrganization();
    } else {
      setOrganization(null);
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        isLoading,
        setUser,
        setOrganization,
        refreshUser,
        refreshOrganization,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
