# Plan zajęć — dostępność transportu publicznego w QGIS (easy-OTP i easy-R5)

**Dla kogo:** studenci II stopnia planowania przestrzennego, przedmiot *Geograficzne systemy
informacji przestrzennej*. Prowadzący z zewnątrz (Michał Kaczorowski, GISBoost).
**Forma:** laboratorium, 2 × 45 min + przerwa (120 min razem). Każdy student ma komputer, na którym
działają OTP i R5.
**Zasada:** wszystko da się wyklikać w QGIS. Wiersz poleceń pojawia się tylko na slajdach jako
kontrast („tak to wyglądało w R”).

## Cel zajęć

Po zajęciach student:

1. wie, czym różnią się bufor, izochrona i dostępność liczona w czasie;
2. umie zainstalować easy-OTP i easy-R5, pobrać silniki i dane, zbudować sieć dla swojego miasta;
3. umie policzyć izochrony i dostępność do szkół na siatce heksagonalnej;
4. umie porównać dwa dni (wakacje vs rok szkolny) i pokazać na mapie, gdzie dostępność spadła,
   a gdzie wzrosła;
5. umie podać wynik w liczbie mieszkańców (dane GUS NSP 2021), a nie tylko w heksach;
6. wie, że rozkład jazdy to plan, a nie rzeczywistość, i skąd brać dane o tym, jak było naprawdę.

## Dane i dni analizy

- **Miasto:** każdy student wybiera jedno z 15: Elbląg, Gdańsk, GZM (41 gmin), Kielce, Kraków,
  Łódź, Lublin, Poznań, Przemyśl, Radom, Rybnik, Rzeszów, Suwałki, Szczecin, Warszawa.
  Te same miasta są w module pobierania easy-R5 (indeks gtfs-dashboard).
  Duże sieci (Warszawa, GZM) liczą się najdłużej: siatka 1000 m zamiast 500 m.
- **Dni:** środa **26.08.2026** (wakacje) i środa **16.09.2026** (rok szkolny), wersja rozkładowa
  (`scheduled`). Oba dni są w indeksie dla wszystkich 15 miast.
- **OSM:** przycięty do granic miasta (bufor 1 km), jeden plik `.osm.pbf` na miasto.
- **Ludność:** GUS NSP 2021, obwody spisowe i rejony statystyczne na całą Polskę (BREC 2021)
  oraz tabele Excel GUS. Student sam wycina swoje miasto w QGIS, dalej łączą je algorytmy wtyczek.

### Paczka danych (Releases repozytorium)

```
paczka/
├── osm/<miasto>.osm.pbf              ← przycięty OSM, 15 plików
├── granice/<miasto>_granica.gpkg     ← granica miasta (dla GZM: 41 gmin), EPSG:2180
├── gtfs/<miasto>/2026-08-26/…_static_gtfs_….zip   ← awaryjnie, gdyby pobieranie nie ruszyło
├── gtfs/<miasto>/2026-09-16/…_static_gtfs_….zip
└── gus/
    ├── brec_2021_polska.gpkg         ← warstwy: obwody_spisowe, rejony_statystyczne
    ├── ludnosc_nsp_2021.xlsx         ← ludność wg płci i grup wieku, arkusz na województwo
    └── (gospodarstwa, rodziny — 4 dodatkowe tabele NSP 2021)
silniki/                              ← awaryjne silniki do skopiowania (pendrive / dysk)
├── otp/  (Temurin 8 JRE + otp-1.5.0-shaded.jar)
└── r5/   (Temurin 21 JDK + r5-v7.6-all.jar + skompilowany runner)
```

Pliki GTFS z gtfs-dashboard mają w nazwie `static_gtfs`, więc OTP 1.5 je rozpozna
(OTP szuka „gtfs” w nazwie pliku). Ten sam plik GTFS idzie do obu wtyczek.

## Przebieg (120 min)

| Min | Blok | Co robi prowadzący | Co robią studenci |
|---|---|---|---|
| 0–5 | Start | Link do strony, wybór miasta | Instalują easy-OTP i easy-R5 z repozytorium wtyczek QGIS i **od razu** uruchamiają oba moduły pobierania silników (idą w tle podczas wstępu) |
| 5–15 | Wstęp | Kim jestem. Bufor → izochrona → dostępność w czasie. Dane: GTFS i OSM | Słuchają, pobieranie trwa |
| 15–25 | OTP: jak działa | Graf z OSM i GTFS, A* i Tung-Chew, podróż od drzwi do drzwi. Jeden-do-wielu i wiele-do-wielu, Żabki w 10 min | — |
| 25–30 | OTP: metoda temporalna | 961 powierzchni, 4 klasy obsługi. 12 kroków w R → kilka algorytmów wtyczki. Artykuł ESRP: 6 miast | — |
| 30–50 | **Ćwiczenie 1 (OTP)** | Pokazuje na rzutniku krok po kroku | Izochrony 15/30/45 min z dworca/uczelni o 8:00 i o 22:00; izochrony w czasie i animacja w Temporal Controller |
| 50–55 | Przerwa | | Ci, którzy nie zdążyli, kończą ćwiczenie 1 |
| 55–65 | R5: czym się różni | Każda minuta okna odjazdów, percentyle, Monte Carlo; szybkość; scenariusze. Przykłady: demo Łódź (szkoły, nowy tramwaj), mapy-analizy | — |
| 65–100 | **Ćwiczenie 2 (R5): wakacje vs szkoła** | Prowadzi krok po kroku, pilnuje tempa | Opis niżej |
| 100–112 | Rozkład to nie rzeczywistość | GTFS-RT → zrealizowany rozkład P50/P85 → easy-GTFS-RT, gtfs-dashboard; mapy-analizy na żywo (opóźnienia a dostępność, zmiana sieci w Łodzi 5.10 z parą kontrolną) | Mogą pobrać wariant P50 tego samego dnia |
| 112–120 | Podsumowanie | Co dalej, materiały, zadanie domowe | — |

Rezerwa czasu: jeśli ćwiczenie 1 się przeciąga, animację w czasie przenosimy do zadania domowego.
Ćwiczenia 2 nie skracamy — to puenta zajęć.

## Ćwiczenie 1 — izochrony w OTP (20 min)

1. *easy-OTP → Setup → Download Java 8 JRE and OpenTripPlanner Jar* (już pobrane na starcie).
   Awaryjnie: skopiuj `silniki/otp/` i wskaż ścieżki w *Advanced*.
2. *Diagnostics → Test OTP server* — czy Java i jar są widoczne.
3. Do jednego folderu: `paczka/osm/<miasto>.osm.pbf` i plik GTFS z 16.09.2026.
4. *Analysis → Generate isochrones*: punkt (kliknięcie na mapie: dworzec lub uczelnia), TRANSIT,
   progi `15,30,45`, data 2026-09-16, godzina 08:00. Pierwszy przebieg buduje graf (najdłuższy krok).
5. To samo o 22:00. Porównanie dwóch warstw — dyskusja: dlaczego wieczorem zasięg się kurczy.
6. *Generate isochrones over time*: ten sam punkt, próg 30 min, 6:00–22:00 co 15 min →
   Temporal Controller → animacja.

**Pytanie do dyskusji:** gdzie zasięg rośnie skokowo (kolej, tramwaj), a gdzie jest „poszarpany”?

## Ćwiczenie 2 — wakacje vs rok szkolny w R5 (35 min)

**Pytanie:** ilu uczniów (10–19 lat) ma szkołę w zasięgu 30 minut transportem publicznym rano
w wakacje, a ilu we wrześniu? Gdzie różnica jest największa?

### A. Dane (10 min)

1. *Easy-R5 → Download transit recordings…*: miasto, dzień **2026-08-26**, wariant *scheduled*.
   Potem drugi raz: **2026-09-16**. Każdy dzień ląduje w osobnym folderze — tak ma być.
2. *Diagnostics → Check transit data* dla obu folderów z ich datą. Zero błędów = można budować.
   (Pułapka do omówienia: data bez kursów daje po cichu same trasy piesze.)
3. *Setup → Build R5 network* dwa razy: ten sam `paczka/osm/<miasto>.osm.pbf`, raz folder
   z 26.08, raz z 16.09.

### B. Siatka, cele, ludność (10 min, równolegle z budową sieci)

4. Wczytaj `paczka/granice/<miasto>_granica.gpkg`.
5. Siatka: *Processing → Create grid* (heksagony, 500 m, EPSG:2180, zasięg = granica) →
   *Extract by location* (przecina granicę) → *Centroids*. W kalkulatorze pól dodaj `hex_id`
   (`@row_number`) — to identyfikator do łączenia.
6. Szkoły: wczytaj `<miasto>.osm.pbf` w QGIS (warstwy *points* i *multipolygons*), filtr
   `"other_tags" LIKE '%"amenity"=>"school"%'`, z poligonów *Centroids*, scal obie warstwy.
7. Ludność:
   - z `paczka/gus/brec_2021_polska.gpkg` wybierz obwody swojego miasta
     (*Extract by location* z granicą miasta albo wyrażenie na polu `GMINA`);
   - *Easy-R5 → Prepare population layer*: `ludnosc_nsp_2021.xlsx`, arkusz = województwo,
     kolumna `10-19`, klucz `OBWOD`;
   - *Population overlay*: ludność na heksy.

### C. Analiza i porównanie (15 min)

8. *Run accessibility* dwa razy z **identycznymi** parametrami: origins = centroidy heksów
   (`ORIGIN_ID_FIELD = hex_id`), destinations = szkoły, okno 7:00–9:00, P50, próg 30 min.
   Raz sieć i data 26.08, raz 16.09.
9. *Scenarios → Compare scenarios*: A = 26.08, B = 16.09, pole dostępności, *higher is better*.
   Narzędzie odmówi porównania, jeśli metoda się różni — to celowe.
10. Połącz wynik z heksami (*Join attributes by field value*, `hex_id`), styl według `diff`.
11. Kontrola ręczna: kalkulator pól `"value_b" - "value_a"` musi dać to samo co `diff`.
12. *Summarize accessibility equity* dla obu przebiegów z ludnością 10–19 → zdanie
    „X% uczniów ma szkołę w 30 min w wakacje, Y% we wrześniu”.

**Dyskusja:** różnica to nie tylko „szkoła vs wakacje”. Żeby oddzielić efekt rozkładu od zwykłej
zmienności dnia, porównuje się też dwa dni z tego samego okresu (para kontrolna) — tak jak
w analizie zmiany sieci w Łodzi z 5.10.

## Zadanie domowe (do wyboru)

- Analiza temporalna w easy-OTP (interwał 15 min) dla tego samego punktu w obu dniach i
  *Compare temporal accessibility*.
- To samo ćwiczenie 2 na wariancie zrealizowanym P50 zamiast rozkładowego: o ile rzeczywistość
  odbiega od planu?
- Scenariusz w easy-R5: narysuj nową linię (*Build scenario*) i policz, ilu uczniom pomoże.

## Plan B na sali

- Pobieranie silników nie działa → `silniki/` z pendrive’a, ścieżki w *Advanced*.
- Pobieranie GTFS nie działa → `paczka/gtfs/<miasto>/<data>/`.
- Komputer za słaby na Warszawę / GZM → mniejsze miasto albo siatka 1000 m.
- Brak czasu na ludność → wynik w liczbie heksów, ludność w zadaniu domowym.

## Do sprawdzenia przed zajęciami (próba generalna)

- [ ] Czas budowy grafu OTP i sieci R5 na przyciętym pliku dla Łodzi, Warszawy i GZM.
- [ ] Czy OTP 1.5 wczytuje GTFS z gtfs-dashboard bez zmiany nazwy.
- [ ] *Prepare population layer* na `ludnosc_nsp_2021.xlsx` (format „raw” z GUS) i obwodach z BREC.
- [ ] Pełny przebieg ćwiczenia 2 dla jednego miasta, zrzuty ekranu do strony.
- [ ] Rozmiar paczki do pobrania (BREC na Polskę to ok. 800 MB — spakować).
