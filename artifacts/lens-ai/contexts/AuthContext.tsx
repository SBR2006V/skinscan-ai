import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type User = {
  id: string;
  email: string;
  name: string;
  avatarColor: string;
  bio?: string;
  joinedAt: number;
};

type StoredAccount = User & { passwordHash: string };

type AuthContextValue = {
  user: User | null;
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<Pick<User, "name" | "bio" | "email">>) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const ACCOUNTS_KEY = "lens-ai:accounts";
const SESSION_KEY = "lens-ai:session";

const AVATAR_COLORS = [
  "#5b5bff",
  "#a855f7",
  "#ec4899",
  "#14b8a6",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
];

function makeId(): string {
  return Date.now().toString() + Math.random().toString(36).slice(2, 9);
}

function pickAvatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

// NOTE: This is a lightweight client-side hash for demo/local-only auth.
// For production, replace this with real backend auth (JWT, OAuth, etc.).
function hashPassword(pw: string): string {
  let h1 = 0x811c9dc5;
  for (let i = 0; i < pw.length; i++) {
    h1 ^= pw.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193);
  }
  return (h1 >>> 0).toString(36) + ":" + pw.length.toString(36);
}

async function readAccounts(): Promise<StoredAccount[]> {
  const raw = await AsyncStorage.getItem(ACCOUNTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as StoredAccount[];
  } catch {
    return [];
  }
}

async function writeAccounts(accounts: StoredAccount[]): Promise<void> {
  await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function stripPassword(account: StoredAccount): User {
  const { passwordHash: _pw, ...user } = account;
  return user;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        const sessionId = await AsyncStorage.getItem(SESSION_KEY);
        if (sessionId) {
          const accounts = await readAccounts();
          const found = accounts.find((a) => a.id === sessionId);
          if (found) setUser(stripPassword(found));
        }
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !password) throw new Error("Email and password are required");
    const accounts = await readAccounts();
    const found = accounts.find((a) => a.email.toLowerCase() === trimmed);
    if (!found) throw new Error("No account found with that email");
    if (found.passwordHash !== hashPassword(password)) {
      throw new Error("Incorrect password");
    }
    await AsyncStorage.setItem(SESSION_KEY, found.id);
    setUser(stripPassword(found));
  }, []);

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const trimmedName = name.trim();
      const trimmedEmail = email.trim().toLowerCase();
      if (!trimmedName) throw new Error("Please enter your name");
      if (!trimmedEmail || !trimmedEmail.includes("@")) {
        throw new Error("Please enter a valid email");
      }
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }
      const accounts = await readAccounts();
      if (accounts.some((a) => a.email.toLowerCase() === trimmedEmail)) {
        throw new Error("An account with that email already exists");
      }
      const id = makeId();
      const account: StoredAccount = {
        id,
        email: trimmedEmail,
        name: trimmedName,
        avatarColor: pickAvatarColor(trimmedEmail),
        joinedAt: Date.now(),
        passwordHash: hashPassword(password),
      };
      await writeAccounts([...accounts, account]);
      await AsyncStorage.setItem(SESSION_KEY, id);
      setUser(stripPassword(account));
    },
    [],
  );

  const signInWithGoogle = useCallback(async () => {
    // Lightweight demo Google sign-in: provisions a guest demo account so the
    // user can experience the app end-to-end. Real OAuth requires linking
    // a provider — this stub keeps the flow working in Expo Go without it.
    const accounts = await readAccounts();
    const demoEmail = "guest@lens.ai";
    let existing = accounts.find((a) => a.email === demoEmail);
    if (!existing) {
      existing = {
        id: makeId(),
        email: demoEmail,
        name: "Guest",
        avatarColor: pickAvatarColor(demoEmail),
        joinedAt: Date.now(),
        passwordHash: hashPassword(makeId()),
      };
      await writeAccounts([...accounts, existing]);
    }
    await AsyncStorage.setItem(SESSION_KEY, existing.id);
    setUser(stripPassword(existing));
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (patch: Partial<Pick<User, "name" | "bio" | "email">>) => {
      if (!user) throw new Error("Not signed in");
      const accounts = await readAccounts();
      const idx = accounts.findIndex((a) => a.id === user.id);
      if (idx === -1) throw new Error("Account missing");
      const next: StoredAccount = {
        ...accounts[idx],
        ...patch,
        email: patch.email ? patch.email.trim().toLowerCase() : accounts[idx].email,
        name: patch.name?.trim() || accounts[idx].name,
      };
      const updated = [...accounts];
      updated[idx] = next;
      await writeAccounts(updated);
      setUser(stripPassword(next));
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      initializing,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      updateProfile,
    }),
    [user, initializing, signIn, signUp, signInWithGoogle, signOut, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
