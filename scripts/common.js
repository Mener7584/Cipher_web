import { clearSession, getSession } from "./auth.js";

export function requireRole(role) {
    const session = getSession();
    if (!session || session.role !== role) {
        window.location.replace("index.html");
        return null;
    }
    return session;
}

export function bindLogout() {
    for (const button of document.querySelectorAll("[data-logout]")) {
        button.addEventListener("click", () => {
            clearSession();
            window.location.replace("index.html");
        });
    }
}

export function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "Невідома дата";
    }

    return new Intl.DateTimeFormat("uk-UA", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(date);
}
