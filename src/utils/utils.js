export function trimString(str, maxLength) {
    if (!str) return '';
    return str.length > maxLength ? `${str.substring(0, maxLength)}...` : str;
}
export function decodeHTMLEntities(str) {
    const parser = new DOMParser();
    const decoded = parser.parseFromString(str, 'text/html').body.textContent;
    return decoded;
}
