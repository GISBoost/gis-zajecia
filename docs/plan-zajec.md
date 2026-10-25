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
- **Dni:** środa **26.08.2026** (wakacje) i środa **16.09.2026** (rok szkolny), rozkład zrealizowany
  P50 z nagrań GTFS-RT (P85 jako wariant dodatkowy). Oba dni są w indeksie dla wszystkich 15 miast.
- **OSM:** przycięty do granic miasta (bufor 1 km), jeden plik `.osm.pbf` na miasto.
- **Ludność:** GUS NSP 2021, obwody spisowe i rejony statystyczne na całą Polskę (BREC 2021)
  oraz tabele Excel GUS. Student sam wycina swoje miasto w QGIS, dalej łączą je algorytmy wtyczek.

### Paczka danych (Releases repozytorium)

```
osm_miasta.7z     → osm/<miasto>.osm.pbf              ← przycięty OSM, 15 plików
granice_miast.7z  → granice/<miasto>_granica.gpkg     ← granica miasta (dla GZM: 41 gmin), EPSG:2180
gtfs_p50.7z       → gtfs_p50/<miasto>/<data>/<miasto>_realized_gtfs_<data>_p50.zip
                                                       ← awaryjnie, 26.08 i 16.09, gdyby pobieranie nie ruszyło
dane_gus.7z       → gus/brec_2021_polska.gpkg         ← warstwy: obwody_spisowe, rejony_statystyczne
                    gus/ludnosc_nsp_2021.xlsx         ← ludność wg płci i grup wieku, arkusz na województwo
                    gus/… (gospodarstwa, rodziny — 4 dodatkowe tabele NSP 2021)
silniki/                              ← awaryjne silniki do skopiowania (pendrive / dysk)
├── otp/  (Temurin 8 JRE + otp-1.5.0-shaded.jar)
└── r5/   (Temurin 21 JDK + r5-v7.6-all.jar + skompilowany runner)
```

Pliki P50 w paczce mają w nazwie `realized_gtfs`, więc OTP 1.5 je rozpozna (OTP szuka „gtfs”
w nazwie pliku). Ten sam plik GTFS idzie do obu wtyczek. Silniki nie są w wydaniu, tylko na pendrivie.

## Przebieg (120 min)

| Min | Blok | Co robi prowadzący | Co robią studenci |
|---|---|---|---|
| 0–5 | Start | Link do strony, wybór miasta | Instalują easy-OTP i easy-R5 z repozytorium wtyczek QGIS i **od razu** uruchamiają oba moduły pobierania silników (idą w tle podczas wstępu) |
| 5–12 | Czym jest OTP | Planer podróży (jak Google Maps / jakdojade), gdzie działa (Norwegia, Finlandia, Islandia, Poznań). Dane: GTFS i OSM (Geofabrik, OSM by the Slice). Czym różni się od Valhalla, ORS Tools, QNEAT3: zna rozkład jazdy. Bufor a izochrona | Słuchają, pobieranie trwa |
| 12–22 | Od R do wtyczki | otpr w RStudio: izochrona 15/30/45; pętla z heksów na kampus PŁ (czas + przesiadki, ponad 5 min); powierzchnia czasu podróży w 1 s (limit 120 min); jeden-do-wielu i wiele-do-wielu; Żabki w 10 min (film + dwa kroki algorytmu) | — |
| 22–30 | Czas obsługi transportem | Powierzchnia co minutę 6–22 (961), stos rastrów, zliczenie minut ≤ 30 min, 4 klasy, nakładka GUS. 12 kroków ręcznie → easy-OTP. Artykuł ESRP (DOI) | — |
| 30–50 | **Ćwiczenie 1 (OTP)** | Pokazuje na rzutniku krok po kroku | Izochrona 30 min z jednego punktu co godzinę 6:00–22:00, animacja w Temporal Controller |
| 50–60 | Izochrona z każdego miejsca (R5) | Wszystkie heksy naraz, każda minuta okna odjazdów, percentyle. Przykłady z easy-R5/tools: usługi w 30 min (Łódź), koszt opóźnień (Łódź), uczelnie w 6 miastach; mapy-analizy | Kto skończył ćwiczenie 1, uruchamia pobieranie nagrań do ćwiczenia 2 |
| 60–100 | **Ćwiczenie 2 (R5): wakacje a rok szkolny na danych RT** | Prowadzi krok po kroku, pilnuje tempa | Opis niżej |
| 100–115 | Skąd dane i co z nich wychodzi | 1) easy-GTFS-RT: nagrywanie VehiclePositions co 60 s, dopasowanie, interpolacja, P50/P85, przebudowa GTFS (zrzut wydania Łódź 16.09); 2) gtfs-dashboard: katalog dnia, wykres opóźnień, ten sam indeks co moduł pobierania Easy-R5; 3) mapy-analizy na żywo (Dokąd dojadę?, Ile kosztują opóźnienia?, odstępy na przystankach, Łódzkie, Gdzie mieszkać, schemat linii); 4) zadanie domowe | Otwierają katalog dla swojego miasta |
| 115–120 | Podsumowanie | Co dalej, materiały | — |

Bez przerwy w środku: zajęcia idą ciągiem. Rezerwa czasu: jeśli ćwiczenie 1 się przeciąga,
wariant co 15 min przenosimy do zadania domowego. Ćwiczenia 2 nie skracamy — to puenta zajęć.

## Ćwiczenie 1 — izochrona co godzinę w OTP (20 min)

**Pytanie:** jak zmienia się zasięg 30 minut z jednego miejsca w ciągu dnia?

1. *easy-OTP → Setup → Download Java 8 JRE and OpenTripPlanner Jar* (już pobrane na starcie).
   Awaryjnie: skopiuj `silniki/otp/` i wskaż ścieżki w *Advanced*.
2. *Diagnostics → Test OTP server* — czy Java i jar są widoczne.
3. Do jednego folderu: `osm/<miasto>.osm.pbf` i `<miasto>_realized_gtfs_2026-09-16_p50.zip` z paczki.
4. *Analysis → Generate isochrones over time*: punkt (kliknięcie na mapie: dworzec lub uczelnia),
   TRANSIT, FROM, próg `30`, data 2026-09-16, okno 06:00–22:00, **interwał 60 min** → 17 izochron
   z polem `time` (QDateTime). Pierwszy przebieg buduje graf (najdłuższy krok).
5. *Właściwości warstwy → Czasowe*: dynamiczne właściwości czasowe, *Pojedyncze pole z datą/czasem*,
   pole `time`, czas trwania zdarzenia 60 min.
6. *Widok → Panele → Temporal Controller*: animacja, zakres z warstw, krok 1 h → odtwórz.
7. Dla chętnych: interwał 15 min albo progi `15,30`.

Obrazek na stronie przy ćwiczeniu (izochrony 15/30/45) pokazuje inny algorytm
(*Generate isochrones*) — strona to zaznacza.

**Pytanie do dyskusji:** o której zasięg jest największy, a o której najmniejszy? Gdzie rośnie
skokowo (kolej, tramwaj), a gdzie jest „poszarpany”? Dlaczego wieczorem kurczy się bardziej
na peryferiach?

## Ćwiczenie 2 — wakacje a rok szkolny na drogach, R5 na danych RT (35 min)

**Pytanie:** jaka jest różnica między wakacjami a rokiem szkolnym na drogach? Ilu uczniów
(10–19 lat) ma szkołę w zasięgu 30 minut transportem publicznym rano w wakacje, a ilu we wrześniu?

Liczymy na **rozkładzie zrealizowanym P50** z nagrań GTFS-RT (gtfs-dashboard), nie na planowym:
w wyniku są i zmiany rozkładu, i korki. Wariant **P85** (ostrożny) jako dodatkowy. Oba dni mają
P50 i P85 dla wszystkich 15 miast (manifest gtfs-dashboard, status `ok`, pokrycie 6:00–22:00).

### A. Dane (10 min)

1. *Easy-R5 → Download transit recordings…*: miasto, dzień **2026-08-26**, wariant **P50**.
   Potem drugi raz: **2026-09-16**, P50. Każdy dzień ląduje w osobnym folderze — tak ma być.
2. *Diagnostics → Check transit data* dla obu folderów z ich datą. Zero błędów = można budować.
   (Pułapka do omówienia: data bez kursów daje po cichu same trasy piesze.)
3. *Setup → Build R5 network* dwa razy: ten sam `osm/<miasto>.osm.pbf`, raz folder
   z 26.08, raz z 16.09.

### B. Siatka, cele, ludność (10 min, równolegle z budową sieci)

4. Wczytaj `granice/<miasto>_granica.gpkg`.
5. Siatka: *Processing → Create grid* (heksagony, 500 m, EPSG:2180, zasięg = granica) →
   *Extract by location* (przecina granicę) → *Centroids*. W kalkulatorze pól dodaj `hex_id`
   (`@row_number`) — to identyfikator do łączenia.
6. Szkoły: wczytaj `<miasto>.osm.pbf` w QGIS (warstwy *points* i *multipolygons*), filtr
   `"other_tags" LIKE '%"amenity"=>"school"%'`, z poligonów *Centroids*, scal obie warstwy.
7. Ludność:
   - z `gus/brec_2021_polska.gpkg` wybierz obwody swojego miasta
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
13. Wariant dodatkowy: 16.09 w wariancie **P85**, trzecia sieć, *Run accessibility* z tymi samymi
    parametrami, porównanie z P50 tego samego dnia: ilu uczniów traci szkołę, gdy trafi na wolniejszy kurs.

**Dyskusja:** różnica to nie tylko „szkoła vs wakacje”. Żeby oddzielić efekt rozkładu od zwykłej
zmienności dnia, porównuje się też dwa dni z tego samego okresu (para kontrolna) — tak jak
w analizie zmiany sieci w Łodzi z 5.10.

## Zadanie domowe (do wyboru)

- Analiza temporalna w easy-OTP (interwał 15 min) dla tego samego punktu w obu dniach i
  *Compare temporal accessibility*.
- Ćwiczenie 2 dla 16.09 na rozkładzie planowym (`scheduled`) i porównanie z P50: o ile
  rzeczywistość odbiega od planu?
- Scenariusz w easy-R5: narysuj nową linię (*Build scenario*) i policz, ilu uczniom pomoże.

## Plan B na sali

- Pobieranie silników nie działa → `silniki/` z pendrive’a, ścieżki w *Advanced*.
- Pobieranie GTFS nie działa → `gtfs_p50.7z`, folder `<miasto>/<data>/`.
- Komputer za słaby na Warszawę / GZM → mniejsze miasto albo siatka 1000 m.
- Brak czasu na ludność → wynik w liczbie heksów, ludność w zadaniu domowym.

## Do sprawdzenia przed zajęciami (próba generalna)

- [ ] Czas budowy grafu OTP i sieci R5 na przyciętym pliku dla Łodzi, Warszawy i GZM.
- [ ] Czy OTP 1.5 wczytuje GTFS z gtfs-dashboard bez zmiany nazwy.
- [ ] *Prepare population layer* na `ludnosc_nsp_2021.xlsx` (format „raw” z GUS) i obwodach z BREC.
- [ ] Pełny przebieg ćwiczenia 2 dla jednego miasta, zrzuty ekranu do strony.
- [ ] Rozmiar paczki do pobrania (BREC na Polskę to ok. 800 MB — spakować).
