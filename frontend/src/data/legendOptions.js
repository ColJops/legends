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

export const getCategoryLabel = (value) =>
    categories.find((category) => category.value === value)?.label ||
    "Brak kategorii";

export const getRegionLabel = (value) =>
    regions.find((region) => region.value === value)?.label ||
    "Nieznany region";