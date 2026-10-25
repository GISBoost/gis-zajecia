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
pendrive prowadzącego (poza wydaniem, ok. 770 MB):
├── otp.7z            ← Temurin 8 JRE + otp-1.5.0-shaded.jar
├── r5.7z             ← Temurin 21 JDK + r5-v7.6-all.jar
├── otp_graf_lodz.7z  ← gotowy graf OTP Łodzi (16.09 P50), folder otp_praca_lodz = Katalog roboczy
├── dane_lodz.7z      ← lodz.osm.pbf + GTFS 26.08 P50, 16.09 P50, 16.09 P85
└── dane_gus.7z, granice_miast.7z  ← kopie z wydania
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

Nazwy w polskim QGIS są przetłumaczone; strona podaje obie wersje. Wyszukiwarka Przybornika
Processing znajduje algorytm po obu.

1. *easy-OTP → Setup → Download Java 8 JRE and OpenTripPlanner Jar* (PL: *1 · Konfiguracja →
   Pobierz Java 8 JRE i plik Jar OpenTripPlanner*), już pobrane na starcie. Wtyczka zapamiętuje
   Javę i jar (wymaga wersji easy-OTP z poprawką domyślnego jara). Awaryjnie: `otp/` z pendrive’a.
2. *Diagnostics → Test OTP server* (PL: *Test serwera OTP*) → „Wszystkie testy zaliczone”.
3. `osm/<miasto>.osm.pbf` i `<miasto>_realized_gtfs_2026-09-16_p50.zip` z paczki; plik rozkładu
   w osobnym folderze bez innych .zip (to *Folder GTFS*).
4. Podkład: wtyczka QuickMapServices, *Internet → QuickMapServices → OSM → OSM Standard*.
5. *Analysis → Generate isochrones over time* (PL: *Generuj izochrony w czasie*): punkt („…” i klik
   na mapie), OSM, Folder GTFS, TRANSIT, FROM, próg `30`, okno 06:00–22:00, **interwał 60**
   (domyślnie 15), data **2026-09-16** (domyślnie dziś), *Katalog roboczy* = nowy pusty folder.
   → 17 izochron z polem `time`. Pierwszy przebieg buduje graf (Łódź: graf 72 s, całość ok. 1,5 min).
6. *Właściwości warstwy → Czas*: *Dynamiczna kontrola czasu*, Tryb: *pojedyncze pole z datą/godziną*,
   pole `time`, czas trwania zdarzenia 60 min (wtyczka tego nie ustawia).
7. *Widok → Panele → Sterowanie czasem* (Temporal Controller): animacja, *Ustaw na pełny zakres*,
   krok 1 h → ▶.
8. Dla chętnych: interwał 15 min albo progi `15,30`, ten sam *Katalog roboczy* (graf już jest).

Obrazek na stronie przy ćwiczeniu (izochrony 15/30/45) pokazuje inny algorytm
(*Generate isochrones*) — strona to zaznacza.

**Pytanie do dyskusji:** o której zasięg jest największy, a o której najmniejszy? Gdzie rośnie
skokowo (kolej, tramwaj), a gdzie jest „poszarpany”? Dlaczego wieczorem kurczy się bardziej
na peryferiach? (Test dla Łodzi Fabrycznej: najmniej 32,0 km² o 14:00, najwięcej 48,3 km² o 20:00.)

## Ćwiczenie 2 — wakacje a rok szkolny na drogach, R5 na danych RT (35 min)

**Pytanie:** jaka jest różnica między wakacjami a rokiem szkolnym na drogach? Ilu uczniów
(10–19 lat) ma szkołę w zasięgu 30 minut transportem publicznym rano w wakacje, a ilu we wrześniu?

Liczymy na **rozkładzie zrealizowanym P50** z nagrań GTFS-RT (gtfs-dashboard), nie na planowym:
w wyniku są i zmiany rozkładu, i korki. Wariant **P85** (ostrożny) jako dodatkowy. Oba dni mają
P50 i P85 dla wszystkich 15 miast (manifest gtfs-dashboard, status `ok`, pokrycie 6:00–22:00).

Realnie ćwiczenie zajmuje 45–55 min (test 25.10.2026): obliczenia trwają ok. 4 min, resztę
zajmuje ok. 25 operacji w QGIS. Jeśli brakuje czasu, P85 robi prowadzący jako pokaz.

### A. Dane (10 min)

1. *Easy-R5 → Download transit recordings…*: City (Łódź na końcu listy, nie ŁKA), najpierw
   Month **2026-08**, potem Day **2026-08-26**, Variant **Realized — median (P50)**, Download into
   np. `C:
5
agrania`. Potem drugi raz: **2026-09-16**, P50. Każdy dzień ląduje w osobnym
   folderze (`…\<miasto>\<data>\p50\`) — tak ma być.
2. *Diagnostics → Check transit data (GTFS)*: plik .zip danego dnia i ta sama data. Zero błędów
   = można budować (ostrzeżenia OK). **Uwaga:** pliki zrealizowane mają kursy w kalendarzu aż do
   31.12.2026, więc pomyłki daty nie wykryje ani ten krok, ani R5 — pilnować zgodności daty i folderu.
3. *Build R5 network* (PL: *Konfiguracja → Zbuduj sieć R5*) dwa razy: ten sam
   `osm/<miasto>.osm.pbf`, raz folder z 26.08, raz z 16.09 (pole podpowiada ostatnie pobranie).
   Zapisać ścieżkę `network.dat` z okna wyników — folder ma losową nazwę. Łódź: 25–34 s.

### B. Siatka, cele, ludność (10 min, równolegle z budową sieci)

4. Wczytaj `granice/<miasto>_granica.gpkg`.
5. Siatka: *Create grid* (heksagony, 500 m, EPSG:2180, zasięg = granica) → *Extract by location*
   (przecina granicę) → **na heksach** `hex_id` = `@row_number` → dopiero potem *Centroids*
   (centroidy dziedziczą `hex_id`). Łódź: 1476 heksów.
6. Szkoły: `<miasto>.osm.pbf` w QGIS (warstwy *points* i *multipolygons*). Filtr na *points*:
   `"other_tags" LIKE '%"amenity"=>"school"%'`; na *multipolygons*: `"amenity" = 'school'`
   (tam `amenity` to osobna kolumna). Z poligonów *Centroids*, scal obie warstwy, dodaj liczbowe
   pole `szkoly` = `1` (potrzebne jako pole możliwości). Łódź: ok. 260 szkół.
7. Ludność:
   - z `gus/brec_2021_polska.gpkg` wybierz obwody swojego miasta (*Extract by location* z granicą);
   - *Prepare population layer* (PL: *Przygotuj warstwę ludności*; wymaga wersji Easy-R5 z poprawką
     importu): `ludnosc_nsp_2021.xlsx`, arkusz dokładnie jak w Excelu (np. `Łódzkie`), kolumna
     `10-19`, klucz `OBWOD` → pole `pop10_19`;
   - *Population overlay* (PL: *Nałóż ludność na siatkę*): siatka = heksy, pole `pop10_19` →
     wynik w polu `population`. Łódź: 53 095 osób w heksach.

### C. Analiza i porównanie (15 min)

8. *Run accessibility* (PL: *Policz dostępność*) dwa razy z **identycznymi** parametrami: sieć
   `network.dat` i data danego dnia, origins = centroidy (`hex_id`), destinations = szkoły,
   pola możliwości = `szkoly`, odjazd 07:00, okno 120, percentyl 50, **progi `30`** (domyślnie
   15,30,45,60). Wynik w polu `acc_szkoly_p50_c30`. Łódź: ok. 30 s.
9. *Scenarios → Compare scenarios*: A = 26.08, B = 16.09, Id field `hex_id`, pole
   `acc_szkoly_p50_c30`, *higher is better*. Narzędzie odmówi porównania, jeśli metoda się różni.
10. *Join attributes by field value*: heksy ← wynik porównania po `hex_id`, styl według `diff` (RdBu).
11. Kontrola ręczna: kalkulator pól `"value_b" - "value_a"` musi dać to samo co `diff`.
12. Dołącz `population` z heksów do wyniku każdego przebiegu (*Join attributes by field value* po
    `hex_id`), potem *Summarize accessibility equity*: pole ludności `population`, pole
    `acc_szkoly_p50_c30`, próg 1 i 10 → „X% uczniów ma szkołę w 30 min w wakacje, Y% we wrześniu”.
    Test dla Łodzi: próg 1 → 95,0% i 95,0%; próg 10 → 77,2% i 76,6%.
13. Wariant dodatkowy: 16.09 *Realized — conservative (P85)*, trzecia sieć, *Run accessibility* z tymi
    samymi parametrami (**percentyl nadal 50**), Summarize i porównanie z P50. Test dla Łodzi: próg 10
    → 73,6% zamiast 76,6%, średnio 23,1 szkoły zamiast 28,1.

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

- Pobieranie silników nie działa → `otp.7z` / `r5.7z` z pendrive’a, ścieżki w *Advanced*.
- Pobieranie GTFS nie działa → `gtfs_p50.7z`, folder `<miasto>/<data>/`.
- Komputer za słaby na Warszawę / GZM → mniejsze miasto albo siatka 1000 m.
- Brak czasu na ludność → wynik w liczbie heksów, ludność w zadaniu domowym.

## Do sprawdzenia przed zajęciami (próba generalna)

- [ ] Czas budowy grafu OTP i sieci R5 na przyciętym pliku dla Łodzi, Warszawy i GZM.
- [ ] Czy OTP 1.5 wczytuje GTFS z gtfs-dashboard bez zmiany nazwy.
- [ ] *Prepare population layer* na `ludnosc_nsp_2021.xlsx` (format „raw” z GUS) i obwodach z BREC.
- [ ] Pełny przebieg ćwiczenia 2 dla jednego miasta, zrzuty ekranu do strony.
- [ ] Rozmiar paczki do pobrania (BREC na Polskę to ok. 800 MB — spakować).
