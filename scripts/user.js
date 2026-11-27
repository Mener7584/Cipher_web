import { getUserById } from "./storage.js";
import { bindLogout, formatDate, requireRole } from "./common.js";

const session = requireRole("user");
if (session) {
    bindLogout();

    const status = document.querySelector("[data-user-status]");
    const user = getUserById(session.id);

    if (!user) {
        status.textContent = "Обліковий запис не знайдено. Увійдіть повторно.";
        status.dataset.state = "error";
    } else {
        document.querySelector("[data-user-name]").textContent = user.firstName;
        document.querySelector("[data-user-first-name]").textContent = user.firstName;
        document.querySelector("[data-user-last-name]").textContent = user.lastName;
        document.querySelector("[data-user-email]").textContent = user.email;
        document.querySelector("[data-user-created]").textContent = formatDate(user.createdAt);
    }
}
