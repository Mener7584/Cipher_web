import { rot13 } from "./rot13.js";

const input = document.querySelector("[data-rot13-input]");
const output = document.querySelector("[data-rot13-output]");
const status = document.querySelector("[data-rot13-status]");

function transform() {
    output.value = rot13(input.value);
    status.textContent = "Перетворення виконано.";
}

document.querySelector("[data-encode]").addEventListener("click", transform);
document.querySelector("[data-decode]").addEventListener("click", transform);

document.querySelector("[data-clear]").addEventListener("click", () => {
    input.value = "";
    output.value = "";
    status.textContent = "Поля очищено.";
    input.focus();
});

document.querySelector("[data-copy]").addEventListener("click", async () => {
    if (!output.value) {
        status.textContent = "Немає тексту для копіювання.";
        return;
    }

    try {
        await navigator.clipboard.writeText(output.value);
        status.textContent = "Результат скопійовано.";
    } catch {
        output.focus();
        output.select();
        status.textContent = "Автоматичне копіювання недоступне. Текст виділено для ручного копіювання.";
    }
});
