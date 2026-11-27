const PBKDF2_ITERATIONS = 210_000;
const HASH_LENGTH = 256;

function bytesToHex(bytes) {
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex) {
    if (typeof hex !== "string" || hex.length % 2 !== 0 || !/^[0-9a-f]*$/i.test(hex)) {
        throw new TypeError("Некоректний формат солі або хешу.");
    }

    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i += 1) {
        bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return bytes;
}

function requireWebCrypto() {
    if (!globalThis.crypto?.subtle || !globalThis.crypto?.getRandomValues) {
        throw new Error("Web Crypto API недоступний. Запустіть сайт через localhost або HTTPS.");
    }
}

export async function hashPassword(password, saltHex) {
    requireWebCrypto();

    const passwordKey = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        "PBKDF2",
        false,
        ["deriveBits"]
    );

    const bits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: hexToBytes(saltHex),
            iterations: PBKDF2_ITERATIONS,
            hash: "SHA-256"
        },
        passwordKey,
        HASH_LENGTH
    );

    return bytesToHex(new Uint8Array(bits));
}

export async function createPasswordRecord(password) {
    requireWebCrypto();

    const saltBytes = crypto.getRandomValues(new Uint8Array(16));
    const passwordSalt = bytesToHex(saltBytes);
    const passwordHash = await hashPassword(password, passwordSalt);

    return { passwordHash, passwordSalt };
}

export async function verifyPassword(password, passwordHash, passwordSalt) {
    const actualHash = await hashPassword(password, passwordSalt);

    if (actualHash.length !== passwordHash.length) {
        return false;
    }

    let difference = 0;
    for (let i = 0; i < actualHash.length; i += 1) {
        difference |= actualHash.charCodeAt(i) ^ passwordHash.charCodeAt(i);
    }

    return difference === 0;
}
