#!/bin/env bash

# Dependencies:
#   - `ogr2ogr`: `apt install gdal-bin`
#   - `ndjson-<*>`: npm package `ndjscon-cli`
#   - `geo2topo`: npm package `topojson-server`

NPM_BIN="$(pwd)/node_modules/.bin"
DIR="$(pwd)/tmp/map-earth"
SRC="ne_110m_admin_0_countries"
DEST="public"
NAME="countries"

prepare() {
  rm -r "$DIR"
  mkdir -p "$DIR"
}

fetch() {
  curl -o "$DIR/$SRC.zip" https://naciscdn.org/naturalearth/110m/cultural/$SRC.zip
}

###
# Initial naive "slim" version breaks rendering for each "feature"
#   - @TODO The outline is rendered as well, making "fill" to apply between
#     outer bounds and the outline, instead of inner bounds
_convert() {
  unzip -od "$DIR" "$DIR/$SRC.zip"

  # Outputs newline delimited GeoJSON
  ogr2ogr -f GeoJSONSeq -t_srs EPSG:4326 "$DIR/$NAME.full.ndjson" "$DIR/$SRC.shp"
  # Reduce the size by omitting properties
  cat "$DIR/$NAME.full.ndjson" \
    | "$NPM_BIN/ndjson-map" 'id = d.properties.ISO_N3, d.properties = { name: d.properties.NAME, id: id === "-99" ? (d.properties.SOV_A3 === "NOR" ? "578" : undefined) : id }, d' > "$DIR/$NAME.slim.ndjson"
  # Convert a newline-delimited JSON stream of values to a JSON array
  # "$NPM_BIN/ndjson-reduce" < "$DIR/$NAME.slim.ndjson" > "$DIR/$NAME.slim.json"
  # Convert to "topojson"
  "$NPM_BIN/geo2topo" -n countries="$DIR/$NAME.slim.ndjson" > "$DIR/$NAME.topo.json"
}

###
# Workaround version
#  - @TODO Simplify topograhy
convert() {
  unzip -od "$DIR" "$DIR/$SRC.zip"

  # Outputs GeoJSON
  ogr2ogr -f GeoJSON -t_srs EPSG:4326 "$DIR/$NAME.full.json" "$DIR/$SRC.shp"
  # Reduce size
  "$NPM_BIN/ndjson-cat" "$DIR/$NAME.full.json" \
    | "$NPM_BIN/ndjson-split" 'd.features' \
    | "$NPM_BIN/ndjson-map" 'id = d.properties.ISO_N3, d.properties = { name: d.properties.NAME, id: id === "-99" ? (d.properties.SOV_A3 === "NOR" ? "578" : undefined) : id }, d' > "$DIR/$NAME.slim.ndjson"
  # Convert to "topojson"
  "$NPM_BIN/geo2topo" -n "$NAME"="$DIR/$NAME.slim.ndjson" > "$DIR/$NAME.topo.json"
}

copy() {
  local FROM="$DIR/$NAME.topo.json"

  cp "$FROM" "$DEST/$NAME-$(cat $FROM | md5sum | awk '{print $1}').json"
}

prepare
fetch
convert
copy
