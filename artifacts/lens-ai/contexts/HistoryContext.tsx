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

export type SkinCondition =
  | "none"
  | "acne"
  | "benign_lesion"
  | "malignant_skin_cancer"
  | "eczema"
  | "fungal_infection"
  | "other";

export type Severity = "none" | "mild" | "moderate" | "severe";
export type Urgency = "routine" | "soon" | "urgent";

export type AnalysisResult = {
  title: string;
  condition: SkinCondition;
  infectionPresent: boolean;
  severity: Severity;
  urgency: Urgency;
  confidence: number;
  summary: string;
  symptoms: string[];
  details: { label: string; value: string }[];
  healthGuide: {
    overview: string;
    dos: string[];
    donts: string[];
    whenToSeeDoctor: string[];
  };
  disclaimer: string;
};

export type HistoryEntry = {
  id: string;
  userId: string;
  imageUri: string;
  result: AnalysisResult;
  createdAt: number;
  bodyArea: string;
};

type HistoryContextValue = {
  entries: HistoryEntry[];
  loading: boolean;
  add: (entry: Omit<HistoryEntry, "id" | "userId" | "createdAt">) => Promise<HistoryEntry>;
  remove: (id: string) => Promise<void>;
  clear: () => Promise<void>;
  getById: (id: string) => HistoryEntry | undefined;
};

const HistoryContext = createContext<HistoryContextValue | null>(null);

const HISTORY_KEY = "lens-ai:history:v2";
const MAX_ENTRIES = 200;

function makeId(): string {
  return Date.now().toString() + Math.random().toString(36).slice(2, 9);
}

async function readAll(): Promise<HistoryEntry[]> {
  const raw = await AsyncStorage.getItem(HISTORY_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

async function writeAll(entries: HistoryEntry[]): Promise<void> {
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
}

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const all = await readAll();
        if (user) {
          setEntries(
            all
              .filter((e) => e.userId === user.id)
              .sort((a, b) => b.createdAt - a.createdAt),
          );
        } else {
          setEntries([]);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const add = useCallback<HistoryContextValue["add"]>(
    async (entry) => {
      if (!user) throw new Error("Not signed in");
      const newEntry: HistoryEntry = {
        ...entry,
        id: makeId(),
        userId: user.id,
        createdAt: Date.now(),
      };
      const all = await readAll();
      const next = [newEntry, ...all].slice(0, MAX_ENTRIES);
      await writeAll(next);
      setEntries(
        next
          .filter((e) => e.userId === user.id)
          .sort((a, b) => b.createdAt - a.createdAt),
      );
      return newEntry;
    },
    [user],
  );

  const remove = useCallback(
    async (id: string) => {
      const all = await readAll();
      const next = all.filter((e) => e.id !== id);
      await writeAll(next);
      if (user) {
        setEntries(
          next
            .filter((e) => e.userId === user.id)
            .sort((a, b) => b.createdAt - a.createdAt),
        );
      }
    },
    [user],
  );

  const clear = useCallback(async () => {
    if (!user) return;
    const all = await readAll();
    const next = all.filter((e) => e.userId !== user.id);
    await writeAll(next);
    setEntries([]);
  }, [user]);

  const getById = useCallback(
    (id: string) => entries.find((e) => e.id === id),
    [entries],
  );

  const value = useMemo<HistoryContextValue>(
    () => ({ entries, loading, add, remove, clear, getById }),
    [entries, loading, add, remove, clear, getById],
  );

  return (
    <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>
  );
}

export function useHistory(): HistoryContextValue {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error("useHistory must be used within HistoryProvider");
  return ctx;
}
