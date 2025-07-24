// File: src/contexts/ScadableAPIKeyContext.tsx

import React, { createContext, useContext, ReactNode, useState } from "react";

/**
 * Shape of the API‑Key context: current key + setter.
 */
interface APIKeyContextType {
    apiKey: string;
    setApiKey: (key: string) => void;
}

const ScadableAPIKeyContext = createContext<APIKeyContextType | undefined>(undefined);

/**
 * Wrap your tree in this provider to make apiKey available everywhere.
 */
export const ScadableAPIKeyProvider = ({
                                           initialKey,
                                           children,
                                       }: {
    /** Bootstrapped value (e.g. from env or login) */
    initialKey: string;
    children: ReactNode;
}) => {
    const [apiKey, setApiKey] = useState(initialKey);

    return (
        <ScadableAPIKeyContext.Provider value={{ apiKey, setApiKey }}>
            {children}
        </ScadableAPIKeyContext.Provider>
    );
};

/**
 * Hook to consume apiKey + setter.
 * Throws if used outside the provider.
 */
export const useScadableAPIKey = (): APIKeyContextType => {
    const ctx = useContext(ScadableAPIKeyContext);
    if (!ctx) {
        throw new Error("useScadableAPIKey must be used within a ScadableAPIKeyProvider");
    }
    return ctx;
};
