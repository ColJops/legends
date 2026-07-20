export function getApiErrorMessage(error, fallback = "Wystąpił nieoczekiwany błąd.") {
    const status = error?.response?.status;
    const backendMessage = error?.response?.data?.message;

    if (status === 401) {
        return "Musisz się zalogować, aby wykonać tę akcję.";
    }

    if (status === 403) {
        return backendMessage || "Nie masz uprawnień do wykonania tej akcji.";
    }

    if (status === 404) {
        return backendMessage || "Nie znaleziono zasobu.";
    }

    if (backendMessage) {
        return backendMessage;
    }

    return fallback;
}