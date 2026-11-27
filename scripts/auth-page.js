import { authenticateAdmin, authenticateUser, registerUser, setSession } from "./auth.js";
import { ensureAdminAccount } from "./database.js";

const loginForm = document.querySelector("[data-login-form]");
const registerForm = document.querySelector("[data-register-form]");
const loginStatus = document.querySelector("[data-login-status]");
const registerStatus = document.querySelector("[data-register-status]");
const tabs = document.querySelectorAll("[data-auth-tab]");
const adminInitialization = ensureAdminAccount();

function setStatus(element, message, state = "") {
    element.textContent = message;
    if (state) {
        element.dataset.state = state;
    } else {
        delete element.dataset.state;
    }
}

function showPanel(name) {
    const isLogin = name === "login";
    loginForm.hidden = !isLogin;
    registerForm.hidden = isLogin;

    for (const tab of tabs) {
        tab.setAttribute("aria-pressed", String(tab.dataset.authTab === name));
    }

    setStatus(loginStatus, "");
    setStatus(registerStatus, "");
}

for (const tab of tabs) {
    tab.addEventListener("click", () => showPanel(tab.dataset.authTab));
}

for (const checkbox of document.querySelectorAll("[data-show-password]")) {
    checkbox.addEventListener("change", () => {
        const targetForm = checkbox.dataset.showPassword === "login" ? loginForm : registerForm;
        for (const input of targetForm.querySelectorAll('input[type="password"], input[data-password-visible]')) {
            input.type = checkbox.checked ? "text" : "password";
            if (checkbox.checked) {
                input.dataset.passwordVisible = "true";
            } else {
                delete input.dataset.passwordVisible;
            }
        }
    });
}

const registerPassword = registerForm.elements.password;
const registerPasswordConfirm = registerForm.elements.passwordConfirm;

function validatePasswordConfirmation() {
    if (registerPasswordConfirm.value && registerPassword.value !== registerPasswordConfirm.value) {
        registerPasswordConfirm.setCustomValidity("Паролі не збігаються.");
    } else {
        registerPasswordConfirm.setCustomValidity("");
    }
}

registerPassword.addEventListener("input", validatePasswordConfirmation);
registerPasswordConfirm.addEventListener("input", validatePasswordConfirmation);

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus(loginStatus, "Перевірка облікових даних...");

    const identity = loginForm.elements.identity.value.trim();
    const password = loginForm.elements.password.value;

    try {
        await adminInitialization;

        if (identity.toLowerCase() === "admin") {
            const valid = await authenticateAdmin(identity, password);
            if (!valid) {
                throw new Error("Неправильний логін або пароль.");
            }

            setSession({ role: "admin", id: "admin", displayName: "Адміністратор" });
            window.location.assign("admin.html");
            return;
        }

        const user = await authenticateUser(identity, password);
        if (!user) {
            throw new Error("Неправильний E-mail або пароль.");
        }

        setSession({
            role: "user",
            id: user.id,
            displayName: `${user.firstName} ${user.lastName}`
        });
        window.location.assign("user.html");
    } catch (error) {
        setStatus(loginStatus, error.message || "Не вдалося виконати вхід.", "error");
    }
});

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    validatePasswordConfirmation();
    if (!registerForm.reportValidity()) {
        return;
    }

    const submitButton = registerForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    setStatus(registerStatus, "Створення облікового запису...");

    try {
        const user = await registerUser({
            firstName: registerForm.elements.firstName.value,
            lastName: registerForm.elements.lastName.value,
            email: registerForm.elements.email.value,
            password: registerPassword.value
        });

        setSession({
            role: "user",
            id: user.id,
            displayName: `${user.firstName} ${user.lastName}`
        });
        window.location.assign("user.html");
    } catch (error) {
        setStatus(registerStatus, error.message || "Не вдалося зареєструвати користувача.", "error");
    } finally {
        submitButton.disabled = false;
    }
});

try {
    await adminInitialization;
} catch (error) {
    setStatus(loginStatus, error.message || "Не вдалося ініціалізувати базу адміністратора.", "error");
}
