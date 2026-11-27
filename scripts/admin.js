import { getUsers } from "./storage.js";
import { bindLogout, formatDate, requireRole } from "./common.js";

const session = requireRole("admin");
if (session) {
    bindLogout();

    const tableBody = document.querySelector("[data-user-table]");
    const searchInput = document.querySelector("[data-user-search]");
    const userCount = document.querySelector("[data-user-count]");
    const status = document.querySelector("[data-admin-status]");

    let users = [];

    function addCell(row, value) {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.append(cell);
    }

    function renderUsers() {
        const query = searchInput.value.trim().toLocaleLowerCase("uk");
        const filteredUsers = users.filter((user) => {
            const searchable = `${user.firstName} ${user.lastName} ${user.email}`.toLocaleLowerCase("uk");
            return searchable.includes(query);
        });

        tableBody.replaceChildren();
        userCount.textContent = `Користувачів: ${filteredUsers.length} / ${users.length}`;

        if (filteredUsers.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.colSpan = 5;
            cell.textContent = users.length === 0
                ? "Зареєстрованих користувачів поки немає."
                : "За вашим запитом нічого не знайдено.";
            row.append(cell);
            tableBody.append(row);
            return;
        }

        const fragment = document.createDocumentFragment();
        filteredUsers.forEach((user, index) => {
            const row = document.createElement("tr");
            addCell(row, String(index + 1));
            addCell(row, user.firstName);
            addCell(row, user.lastName);
            addCell(row, user.email);
            addCell(row, formatDate(user.createdAt));
            fragment.append(row);
        });
        tableBody.append(fragment);
    }

    try {
        users = getUsers();
        renderUsers();
        searchInput.addEventListener("input", renderUsers);
    } catch (error) {
        tableBody.replaceChildren();
        status.textContent = error.message || "Не вдалося прочитати дані користувачів.";
        status.dataset.state = "error";
    }
}
