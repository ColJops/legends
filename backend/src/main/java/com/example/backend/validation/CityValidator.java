package com.example.backend.validation;

import com.example.backend.entity.Region;

import java.util.List;
import java.util.Map;

public class CityValidator {

    private static final Map<Region, List<String>> CITIES_BY_REGION = Map.ofEntries(
            Map.entry(Region.DOLNOSLASKIE, List.of("Wrocław", "Legnica", "Wałbrzych", "Jelenia Góra")),
            Map.entry(Region.KUJAWSKO_POMORSKIE, List.of("Bydgoszcz", "Toruń", "Włocławek", "Grudziądz")),
            Map.entry(Region.LUBELSKIE, List.of("Lublin", "Zamość", "Chełm", "Biała Podlaska")),
            Map.entry(Region.LUBUSKIE, List.of("Gorzów Wielkopolski", "Zielona Góra", "Nowa Sól", "Żary")),
            Map.entry(Region.LODZKIE, List.of("Łódź", "Piotrków Trybunalski", "Pabianice", "Tomaszów Mazowiecki")),
            Map.entry(Region.MALOPOLSKIE, List.of("Kraków", "Tarnów", "Nowy Sącz", "Zakopane")),
            Map.entry(Region.MAZOWIECKIE, List.of("Warszawa", "Radom", "Płock", "Siedlce")),
            Map.entry(Region.OPOLSKIE, List.of("Opole", "Kędzierzyn-Koźle", "Nysa", "Brzeg")),
            Map.entry(Region.PODKARPACKIE, List.of("Rzeszów", "Przemyśl", "Krosno", "Tarnobrzeg")),
            Map.entry(Region.PODLASKIE, List.of("Białystok", "Łomża", "Suwałki", "Augustów")),
            Map.entry(Region.POMORSKIE, List.of("Gdańsk", "Gdynia", "Sopot", "Słupsk")),
            Map.entry(Region.SLASKIE, List.of("Katowice", "Częstochowa", "Gliwice", "Bielsko-Biała")),
            Map.entry(Region.SWIETOKRZYSKIE, List.of("Kielce", "Sandomierz", "Ostrowiec Świętokrzyski", "Skarżysko-Kamienna")),
            Map.entry(Region.WARMINSKO_MAZURSKIE, List.of("Olsztyn", "Elbląg", "Ełk", "Giżycko")),
            Map.entry(Region.WIELKOPOLSKIE, List.of("Poznań", "Kalisz", "Konin", "Gniezno")),
            Map.entry(Region.ZACHODNIOPOMORSKIE, List.of("Szczecin", "Koszalin", "Kołobrzeg", "Świnoujście"))
    );

    private CityValidator() {
    }

    public static boolean isValid(Region region, String city) {
        if (region == null || city == null || city.isBlank()) {
            return false;
        }

        return CITIES_BY_REGION
                .getOrDefault(region, List.of())
                .contains(city.trim());
    }
}
