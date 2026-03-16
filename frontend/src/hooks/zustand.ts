import { create } from "zustand";
import { useSyncExternalStore } from "react";
import { persist } from "zustand/middleware";

type SidebarState = {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
};

export type UseAuthType = {
  email: {
    mail: string;
    digest: string;
    identifier: string;
  };
  setEmail: (email: {
    mail: string;
    digest: string;
    identifier: string;
  }) => void;
  error: string;
  setError: (error: string) => void;
  loading: boolean;
  setLoading: (value: boolean) => void;
};

export type OptionalClassType = {
  optionalClasses: Record<string, boolean>;
  toggleOptional: (courseCode: string, time: string, dayorder: number) => void;
  isOptional: (courseCode: string, time: string, dayorder: number) => boolean;
  exportConfig: () => void;
  importConfig: (configData: string) => boolean;
};

export const useAuth = create<UseAuthType>((set) => ({
  email: {
    mail: "",
    digest: "",
    identifier: "",
  },
  setEmail: (email: { mail: string; digest: string; identifier: string }) =>
    set((state) => ({ ...state, email })),
  error: "",
  setError: (error: string) => set((state) => ({ ...state, error })),
  loading: false,
  setLoading: (loading: boolean) => set((state) => ({ ...state, loading })),
}));

export function useScreen() {
  const isMobile = useSyncExternalStore(
    (callback) => {
      if (typeof window === "undefined") return () => {};
      callback();
      window.addEventListener("resize", callback);
      return () => window.removeEventListener("resize", callback);
    },
    () => {
      if (typeof window === "undefined") return true;
      return window.innerWidth <= 1560;
    },
    () => true
  );
  return { isMobile };
}

export const useSidebar = create<SidebarState>((set) => ({
  isOpen: false,
  setOpen: (open: boolean) => set({ isOpen: open }),
}));

export const useOptionalClasses = create(
  persist<OptionalClassType>(
    (set, get) => ({
      optionalClasses: {},
      toggleOptional: (courseCode: string, time: string, dayorder: number) => {
        const key = `${courseCode}-${time}-${dayorder}`;
        set((state) => ({
          optionalClasses: {
            ...state.optionalClasses,
            [key]: !state.optionalClasses[key],
          },
        }));
      },
      isOptional: (courseCode: string, time: string, dayorder: number) => {
        const key = `${courseCode}-${time}-${dayorder}`;
        return get().optionalClasses[key] || false;
      },
      exportConfig: () => {
        const config = {
          optionalClasses: get().optionalClasses,
          exportDate: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(config, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "optional-classes-config.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },
      importConfig: (configData: string) => {
        try {
          const config = JSON.parse(configData);
          if (config && config.optionalClasses) {
            set({ optionalClasses: config.optionalClasses });
            return true;
          }
          return false;
        } catch (error) {
          console.error("Failed to import config:", error);
          return false;
        }
      },
    }),
    {
      name: "optional-classes-storage",
    }
  )
);
