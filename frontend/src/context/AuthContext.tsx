import { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
    token: string | null;
    role: string | null;
    isInitialized: boolean;
    login: (t: string, r: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isInitialized, setIsInitialized] = useState(false);

    const [token, setToken] = useState<string | null>(() => {
        try {
            return localStorage.getItem("token");
        } catch {
            return null;
        }
    });

    const [role, setRole] = useState<string | null>(() => {
        try {
            return localStorage.getItem("role");
        } catch {
            return null;
        }
    });

    // Mark auth as fully initialized after first render
    // This prevents ProtectedRoute from redirecting before state is settled
    useEffect(() => {
        setIsInitialized(true);
    }, []);

    const login = (t: string, r: string) => {
        try {
            localStorage.setItem("token", t);
            localStorage.setItem("role", r);
        } catch {
            // localStorage unavailable (e.g., incognito with storage disabled)
        }
        setToken(t);
        setRole(r);
    };

    const logout = () => {
        try {
            // Only remove auth keys — don't wipe cart or other data
            localStorage.removeItem("token");
            localStorage.removeItem("role");
        } catch {
            // ignore
        }
        setToken(null);
        setRole(null);
    };

    return (
        <AuthContext.Provider value={{ token, role, isInitialized, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext)!;
