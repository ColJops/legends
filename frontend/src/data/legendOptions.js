export const categories = [
    { value: "LEGENDA", label: "Legenda" },
    { value: "MIT", label: "Mit" },
    { value: "PODANIE", label: "Podanie" },
    { value: "BASN", label: "Baśń" },
    { value: "DUCHY", label: "Duchy" },
    { value: "POTWORY", label: "Potwory" },
    { value: "LEGENDA_MIEJSKA", label: "Legenda miejska" },
    { value: "LEGENDA_MORSKA", label: "Legenda morska" },
    { value: "LEGENDA_HISTORYCZNA", label: "Legenda historyczna" },
];

export const regions = [
    { value: "DOLNOSLASKIE", label: "Dolnośląskie" },
    { value: "KUJAWSKO_POMORSKIE", label: "Kujawsko-pomorskie" },
    { value: "LUBELSKIE", label: "Lubelskie" },
    { value: "LUBUSKIE", label: "Lubuskie" },
    { value: "LODZKIE", label: "Łódzkie" },
    { value: "MALOPOLSKIE", label: "Małopolskie" },
    { value: "MAZOWIECKIE", label: "Mazowieckie" },
    { value: "OPOLSKIE", label: "Opolskie" },
    { value: "PODKARPACKIE", label: "Podkarpackie" },
    { value: "PODLASKIE", label: "Podlaskie" },
    { value: "POMORSKIE", label: "Pomorskie" },
    { value: "SLASKIE", label: "Śląskie" },
    { value: "SWIETOKRZYSKIE", label: "Świętokrzyskie" },
    { value: "WARMINSKO_MAZURSKIE", label: "Warmińsko-mazurskie" },
    { value: "WIELKOPOLSKIE", label: "Wielkopolskie" },
    { value: "ZACHODNIOPOMORSKIE", label: "Zachodniopomorskie" },
];

export const citiesByRegion = {
    DOLNOSLASKIE: ["Wrocław", "Legnica", "Wałbrzych", "Jelenia Góra"],
    KUJAWSKO_POMORSKIE: ["Bydgoszcz", "Toruń", "Włocławek", "Grudziądz"],
    LUBELSKIE: ["Lublin", "Zamość", "Chełm", "Biała Podlaska"],
    LUBUSKIE: ["Gorzów Wielkopolski", "Zielona Góra", "Nowa Sól", "Żary"],
    LODZKIE: ["Łódź", "Piotrków Trybunalski", "Pabianice", "Tomaszów Mazowiecki"],
    MALOPOLSKIE: ["Kraków", "Tarnów", "Nowy Sącz", "Zakopane"],
    MAZOWIECKIE: ["Warszawa", "Radom", "Płock", "Siedlce"],
    OPOLSKIE: ["Opole", "Kędzierzyn-Koźle", "Nysa", "Brzeg"],
    PODKARPACKIE: ["Rzeszów", "Przemyśl", "Krosno", "Tarnobrzeg"],
    PODLASKIE: ["Białystok", "Łomża", "Suwałki", "Augustów"],
    POMORSKIE: ["Gdańsk", "Gdynia", "Sopot", "Słupsk"],
    SLASKIE: ["Katowice", "Częstochowa", "Gliwice", "Bielsko-Biała"],
    SWIETOKRZYSKIE: ["Kielce", "Sandomierz", "Ostrowiec Świętokrzyski", "Skarżysko-Kamienna"],
    WARMINSKO_MAZURSKIE: ["Olsztyn", "Elbląg", "Ełk", "Giżycko"],
    WIELKOPOLSKIE: ["Poznań", "Kalisz", "Konin", "Gniezno"],
    ZACHODNIOPOMORSKIE: ["Szczecin", "Koszalin", "Kołobrzeg", "Świnoujście"],
};

export const getCategoryLabel = (value) =>
    categories.find((category) => category.value === value)?.label || "Brak kategorii";

export const getRegionLabel = (value) =>
    regions.find((region) => region.value === value)?.label || "Nieznany region";