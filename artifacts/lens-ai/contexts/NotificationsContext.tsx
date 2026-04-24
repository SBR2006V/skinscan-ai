import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "@/contexts/AuthContext";

export type Notification = {
  id: string;
  userId: string;
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
  kind: "scan" | "tip" | "system";
};

type NotificationsContextValue = {
  notifications: Notification[];
  unreadCount: number;
  add: (n: Omit<Notification, "id" | "userId" | "createdAt" | "read">) => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  clear: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

const KEY = "lens-ai:notifications";
const MAX = 100;

function makeId(): string {
  return Date.now().toString() + Math.random().toString(36).slice(2, 9);
}

async function readAll(): Promise<Notification[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Notification[];
  } catch {
    return [];
  }
}

async function writeAll(items: Notification[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(items));
}

const WELCOME_TIPS: Array<Omit<Notification, "id" | "userId" | "createdAt" | "read">> = [
  {
    kind: "system",
    title: "Welcome to Lens AI",
    body: "Take a clear photo of any skin area and we'll check for acne, eczema, fungal infections, and more — with a tailored care guide.",
  },
  {
    kind: "tip",
    title: "Tip — for the best results",
    body: "Use bright, even lighting and hold your camera 10–20 cm from the area. Avoid shadows and motion blur.",
  },
  {
    kind: "system",
    title: "Important",
    body: "Lens AI is informational only. Always see a qualified clinician for medical advice or any urgent finding.",
  },
];

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    (async () => {
      const all = await readAll();
      if (!user) {
        setNotifications([]);
        return;
      }
      const mine = all.filter((n) => n.userId === user.id);
      if (mine.length === 0) {
        const seeded: Notification[] = WELCOME_TIPS.map((t) => ({
          ...t,
          id: makeId(),
          userId: user.id,
          createdAt: Date.now() - Math.random() * 1000,
          read: false,
        }));
        const next = [...seeded, ...all].slice(0, MAX);
        await writeAll(next);
        setNotifications(
          next
            .filter((n) => n.userId === user.id)
            .sort((a, b) => b.createdAt - a.createdAt),
        );
      } else {
        setNotifications(mine.sort((a, b) => b.createdAt - a.createdAt));
      }
    })();
  }, [user]);

  const refresh = useCallback(async () => {
    const all = await readAll();
    if (user) {
      setNotifications(
        all
          .filter((n) => n.userId === user.id)
          .sort((a, b) => b.createdAt - a.createdAt),
      );
    }
  }, [user]);

  const add = useCallback<NotificationsContextValue["add"]>(
    async (n) => {
      if (!user) return;
      const item: Notification = {
        ...n,
        id: makeId(),
        userId: user.id,
        createdAt: Date.now(),
        read: false,
      };
      const all = await readAll();
      await writeAll([item, ...all].slice(0, MAX));
      await refresh();
    },
    [user, refresh],
  );

  const markRead = useCallback(
    async (id: string) => {
      const all = await readAll();
      const next = all.map((n) => (n.id === id ? { ...n, read: true } : n));
      await writeAll(next);
      await refresh();
    },
    [refresh],
  );

  const markAllRead = useCallback(async () => {
    if (!user) return;
    const all = await readAll();
    const next = all.map((n) => (n.userId === user.id ? { ...n, read: true } : n));
    await writeAll(next);
    await refresh();
  }, [user, refresh]);

  const remove = useCallback(
    async (id: string) => {
      const all = await readAll();
      await writeAll(all.filter((n) => n.id !== id));
      await refresh();
    },
    [refresh],
  );

  const clear = useCallback(async () => {
    if (!user) return;
    const all = await readAll();
    await writeAll(all.filter((n) => n.userId !== user.id));
    setNotifications([]);
  }, [user]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const value = useMemo<NotificationsContextValue>(
    () => ({ notifications, unreadCount, add, markRead, markAllRead, remove, clear }),
    [notifications, unreadCount, add, markRead, markAllRead, remove, clear],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
