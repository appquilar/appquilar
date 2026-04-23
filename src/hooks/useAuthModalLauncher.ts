const AUTH_MODAL_INITIAL_TAB_KEY = "auth:initialTab";

type AuthModalTab = "signin" | "signup";

const triggerAuthModal = (tab: AuthModalTab, infoMessage?: string) => {
    sessionStorage.setItem(AUTH_MODAL_INITIAL_TAB_KEY, tab);

    if (infoMessage) {
        sessionStorage.setItem("auth:infoMessage", infoMessage);
    }

    const trigger = document.querySelector("[data-trigger-login]") as HTMLElement | null;
    trigger?.click();
};

export const useAuthModalLauncher = () => {
    return {
        openSignIn: (infoMessage?: string) => triggerAuthModal("signin", infoMessage),
        openSignUp: (infoMessage?: string) => triggerAuthModal("signup", infoMessage),
    };
};

