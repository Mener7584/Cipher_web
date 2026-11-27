import { rot13 } from "../rot13/rot13.js";

const USERS_KEY = "encryption-app.users.v1";

function readRawUsers() {
    const value = localStorage.getItem(USERS_KEY);
    if (value === null) {
        return [];
    }

    const users = JSON.parse(value);
    if (!Array.isArray(users)) {
        throw new TypeError("Сховище користувачів має некоректний формат.");
    }

    return users;
}

function decodeUser(record) {
    return {
        ...record,
        firstName: rot13(record.firstName),
        lastName: rot13(record.lastName),
        email: rot13(record.email)
    };
}

export function getUsers() {
    return readRawUsers().map(decodeUser);
}

export function findUserByEmail(email) {
    const normalizedEmail = email.trim().toLocaleLowerCase("uk");
    return getUsers().find(
        (user) => user.email.toLocaleLowerCase("uk") === normalizedEmail
    ) ?? null;
}

export function getUserById(id) {
    return getUsers().find((user) => user.id === id) ?? null;
}

export function saveUser({ firstName, lastName, email, passwordHash, passwordSalt }) {
    const users = readRawUsers();
    const normalizedEmail = email.trim().toLocaleLowerCase("uk");

    const duplicate = users.some((record) => {
        return rot13(record.email).toLocaleLowerCase("uk") === normalizedEmail;
    });

    if (duplicate) {
        throw new Error("Користувач із таким E-mail уже зареєстрований.");
    }

    const user = {
        id: crypto.randomUUID(),
        firstName: rot13(firstName.trim()),
        lastName: rot13(lastName.trim()),
        email: rot13(normalizedEmail),
        passwordHash,
        passwordSalt,
        createdAt: new Date().toISOString()
    };

    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    return decodeUser(user);
}
