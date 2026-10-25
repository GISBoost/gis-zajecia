# Zajęcia GIS — dostępność transportu publicznego w QGIS

Strona i materiały do 2-godzinnego laboratorium dla II stopnia planowania przestrzennego
(przedmiot *Geograficzne systemy informacji przestrzennej*). Studenci pracują w QGIS na
wtyczkach [easy-OTP](https://github.com/GISBoost/easy-OTP) i
[Easy-R5](https://github.com/GISBoost/easy-R5): izochrony, dostępność do szkół, porównanie
dnia wakacyjnego (26.08.2026) z dniem roku szkolnego (16.09.2026), ludność z GUS NSP 2021.
Wszystko da się wyklikać, bez wiersza poleceń.

Adres po publikacji: `https://gisboost.github.io/gis-zajecia/`.

- Plan zajęć dla prowadzącego: [`docs/plan-zajec.md`](docs/plan-zajec.md).
- Wygląd: system [Transit Index](https://github.com/GISBoost/transit-index) (tokeny w
  `src/styles/tokens/`, geometria linii w `src/lib/geometry.ts`, przejazd linii przy przewijaniu
  w `src/scripts/journey.ts`). To kopie z `transit-index/design/`, nie import.

## Strona

Astro, statyczny output, jedna strona. Build tylko w GitHub Actions
(`.github/workflows/deploy.yml`), `dist/` nie trafia do gita.

```
npm ci
npm run dev
```

Dev server serwuje pod `/gis-zajecia/`.

## Paczka danych (Releases, nie w gicie)

Wydanie [`dane-2026-10`](https://github.com/GISBoost/gis-zajecia/releases/tag/dane-2026-10), cztery archiwa 7z:

```
osm_miasta.7z      osm/<miasto>.osm.pbf — 15 miast, OSM przycięty do granic miasta z buforem 1 km
granice_miast.7z   granice/<miasto>_granica.gpkg — granice (GZM: 41 gmin wg GUS), EPSG:2180
dane_gus.7z        gus/brec_2021_polska.gpkg (obwody i rejony, cała Polska) + tabele NSP 2021 (.xlsx)
gtfs_p50.7z        gtfs_p50/<miasto>/<data>/<miasto>_realized_gtfs_<data>_p50.zip — 26.08 i 16.09
SHA256SUMS.txt     sumy kontrolne archiwów
```

Silniki awaryjne (Temurin 8 JRE + OTP 1.5.0, Temurin 21 + R5 7.6 z runnerem) nie są w wydaniu:
prowadzący ma je na sali na pendrivie.

Jak powstała:

- OSM: wyciągi województw z Geofabrik (25.10.2026), granice gmin z OSM wybrane po kodzie
  TERYT (`teryt:terc`), przycięcie `osmosis --bounding-polygon completeWays=yes`.
- GZM: lista gmin z GUS (`gzm_2023.xls`).
- Rejony statystyczne: złączenie obwodów BREC 2021 po polu `REJ`.

## Licencje

- Kod strony: MIT (`LICENSE`).
- Dane OSM: © autorzy OpenStreetMap, ODbL.
- Dane GUS (NSP 2021, BREC 2021): Główny Urząd Statystyczny.
- Rozkłady GTFS: przewoźnicy, przez [gtfs-dashboard](https://gisboost.github.io/gtfs-dashboard/);
  licencje poszczególnych feedów opisuje repozytorium easy-GTFS-RT.
- Ilustracje z prezentacji i artykułu: Michał Kaczorowski.
