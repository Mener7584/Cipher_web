import { createPasswordRecord, verifyPassword } from "./security.js";
import { getAdminRecord } from "./database.js";
import { findUserByEmail, saveUser } from "./storage.js";

const SESSION_KEY = "encryption-app.session.v1";

export async function registerUser({ firstName, lastName, email, password }) {
    if (findUserByEmail(email)) {
        throw new Error("Користувач із таким E-mail уже зареєстрований.");
    }

    const passwordRecord = await createPasswordRecord(password);
    return saveUser({ firstName, lastName, email, ...passwordRecord });
}

export async function authenticateUser(email, password) {
    const user = findUserByEmail(email);
    if (!user) {
        return null;
    }

    const isValid = await verifyPassword(password, user.passwordHash, user.passwordSalt);
    return isValid ? user : null;
}

export async function authenticateAdmin(username, password) {
    const admin = await getAdminRecord(username);
    if (!admin) {
        return false;
    }

    return verifyPassword(password, admin.passwordHash, admin.passwordSalt);
}

export function setSession(session) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession() {
    const value = sessionStorage.getItem(SESSION_KEY);
    if (!value) {
        return null;
    }

    try {
        const session = JSON.parse(value);
        if (!session || !["admin", "user"].includes(session.role) || !session.id) {
            sessionStorage.removeItem(SESSION_KEY);
            return null;
        }
        return session;
    } catch {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
    }
}

export function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
}
