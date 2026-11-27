import { createPasswordRecord } from "./security.js";

const DATABASE_NAME = "encryption-web-app";
const DATABASE_VERSION = 1;
const ADMIN_STORE = "administrators";
const DEFAULT_ADMIN = {
    username: "admin",
    password: "Admin123!"
};

function openDatabase() {
    return new Promise((resolve, reject) => {
        if (!globalThis.indexedDB) {
            reject(new Error("IndexedDB недоступний у цьому браузері."));
            return;
        }

        const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

        request.onupgradeneeded = () => {
            const database = request.result;
            if (!database.objectStoreNames.contains(ADMIN_STORE)) {
                database.createObjectStore(ADMIN_STORE, { keyPath: "username" });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error("Не вдалося відкрити IndexedDB."));
    });
}

function requestResult(request) {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error("Помилка операції IndexedDB."));
    });
}

export async function getAdminRecord(username) {
    const database = await openDatabase();

    try {
        const transaction = database.transaction(ADMIN_STORE, "readonly");
        const result = await requestResult(
            transaction.objectStore(ADMIN_STORE).get(username.trim().toLowerCase())
        );
        return result ?? null;
    } finally {
        database.close();
    }
}

async function saveAdminRecord(record) {
    const database = await openDatabase();

    try {
        const transaction = database.transaction(ADMIN_STORE, "readwrite");
        await requestResult(transaction.objectStore(ADMIN_STORE).put(record));
    } finally {
        database.close();
    }
}

export async function ensureAdminAccount() {
    const existingAdmin = await getAdminRecord(DEFAULT_ADMIN.username);
    if (existingAdmin) {
        return;
    }

    const credentials = await createPasswordRecord(DEFAULT_ADMIN.password);
    await saveAdminRecord({
        username: DEFAULT_ADMIN.username,
        ...credentials,
        createdAt: new Date().toISOString()
    });
}
