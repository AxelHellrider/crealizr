"use client";

import { createContext, useContext, useEffect, useReducer, type ReactNode } from "react";

export type ConsentStatus = "unset" | "granted" | "denied";

const STORAGE_KEY = "cookie-consent";

declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
    }
}

type State = {
    status: ConsentStatus;
    bannerVisible: boolean;
};

type Action =
    | { type: "HYDRATE"; status: ConsentStatus }
    | { type: "GRANT" }
    | { type: "DENY" }
    | { type: "OPEN_PREFERENCES" };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "HYDRATE":
            return { status: action.status, bannerVisible: action.status === "unset" };
        case "GRANT":
            return { status: "granted", bannerVisible: false };
        case "DENY":
            return { status: "denied", bannerVisible: false };
        case "OPEN_PREFERENCES":
            return { ...state, bannerVisible: true };
        default:
            return state;
    }
}

interface CookieConsentContextValue {
    status: ConsentStatus;
    bannerVisible: boolean;
    grant: () => void;
    deny: () => void;
    /** Re-shows the banner so a visitor can change a decision they already made. */
    openPreferences: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

export function CookieConsentProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reducer, { status: "unset", bannerVisible: false });

    // Reads the prior decision from localStorage after mount only, so the
    // banner never flashes on the server-rendered pass before hydration.
    useEffect(() => {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        dispatch({ type: "HYDRATE", status: stored === "granted" || stored === "denied" ? stored : "unset" });
    }, []);

    const grant = () => {
        window.localStorage.setItem(STORAGE_KEY, "granted");
        dispatch({ type: "GRANT" });
        window.gtag?.("consent", "update", {
            ad_storage: "granted",
            ad_user_data: "granted",
            ad_personalization: "granted",
            analytics_storage: "granted",
        });
    };

    const deny = () => {
        window.localStorage.setItem(STORAGE_KEY, "denied");
        dispatch({ type: "DENY" });
        window.gtag?.("consent", "update", {
            ad_storage: "denied",
            ad_user_data: "denied",
            ad_personalization: "denied",
            analytics_storage: "denied",
        });
    };

    const openPreferences = () => dispatch({ type: "OPEN_PREFERENCES" });

    return (
        <CookieConsentContext.Provider value={{ status: state.status, bannerVisible: state.bannerVisible, grant, deny, openPreferences }}>
            {children}
        </CookieConsentContext.Provider>
    );
}

export function useCookieConsent(): CookieConsentContextValue {
    const ctx = useContext(CookieConsentContext);
    if (!ctx) throw new Error("useCookieConsent must be used within CookieConsentProvider");
    return ctx;
}
