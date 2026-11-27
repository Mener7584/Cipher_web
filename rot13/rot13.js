export function rot13(value) {
    return String(value).replace(/[a-zA-Z]/g, (letter) => {
        const base = letter <= "Z" ? 65 : 97;
        return String.fromCharCode(((letter.charCodeAt(0) - base + 13) % 26) + base);
    });
}
