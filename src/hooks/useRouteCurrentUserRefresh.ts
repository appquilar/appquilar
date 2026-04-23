import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

export const useRouteCurrentUserRefresh = (): void => {
    const location = useLocation();
    const { isAuthenticated, refreshCurrentUser } = useAuth();
    const lastPathnameRef = useRef<string | null>(null);

    useEffect(() => {
        const previousPathname = lastPathnameRef.current;
        lastPathnameRef.current = location.pathname;

        if (!isAuthenticated || previousPathname === null) {
            return;
        }

        if (previousPathname === location.pathname) {
            return;
        }

        void refreshCurrentUser();
    }, [isAuthenticated, location.pathname, refreshCurrentUser]);
};
