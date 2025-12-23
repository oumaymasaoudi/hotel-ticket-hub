import { useState, useEffect } from "react";
import { AuthResponse } from "@/services/apiService";

export type UserRole = "client" | "technician" | "admin" | "superadmin";

interface UserWithRole {
  user: { email: string; fullName: string; userId: string } | null;
  session: { token: string } | null;
  role: UserRole | null;
  hotelId: string | null;
  loading: boolean;
}

export const useAuth = (): UserWithRole => {
  const [user, setUser] = useState<{ email: string; fullName: string; userId: string } | null>(null);
  const [session, setSession] = useState<{ token: string } | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [hotelId, setHotelId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si un token existe dans le localStorage
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');

      if (token && userData) {
        try {
          const parsedUserData: AuthResponse = JSON.parse(userData);
          setSession({ token });
          setUser({ email: parsedUserData.email, fullName: parsedUserData.fullName, userId: parsedUserData.userId });
          setRole(parsedUserData.role.toLowerCase() as UserRole);
          setHotelId(parsedUserData.hotelId);
        } catch (error) {
          // Clean localStorage if data is corrupted
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
        }
      }
      setLoading(false);
    };

    checkAuth();

    // Écouter l'événement custom émis après login
    globalThis.addEventListener('auth-change', checkAuth);

    return () => {
      globalThis.removeEventListener('auth-change', checkAuth);
    };
  }, []);

  return { user, session, role, hotelId, loading };
};
