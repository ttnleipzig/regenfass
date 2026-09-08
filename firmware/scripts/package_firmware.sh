#!/usr/bin/env bash
# Build a PlatformIO env and package the flashable artifacts into
# firmware-<env>.zip, mirroring what CI produces:
#
#   boot_app0.bin, bootloader.bin, partitions.bin   (from the env metadata)
#   firmware.bin                                    (the application)
#   firmware_metadata.json                          (offsets + application offset)
#
# Usage: scripts/package_firmware.sh <env> [more envs...]
#        scripts/package_firmware.sh --all
#        OUT_DIR=dist scripts/package_firmware.sh heltec_wifi_lora_32_V3_HCSR04
#
# Options via env vars:
#   OUT_DIR=.            where the zips are written
#   SKIP_BUILD=1         don't run `pio run`, just repackage existing build output
#   BASENAME_PATHS=1     store basenames instead of absolute paths in the metadata

set -euo pipefail

cd "$(dirname "$0")/.."

for tool in pio jq; do
  command -v "$tool" >/dev/null || { echo "error: $tool not found in PATH" >&2; exit 1; }
done

# `zip` isn't installed everywhere; python's zipfile module is an equivalent.
if command -v zip >/dev/null; then
  make_zip() { zip -q -X "$1" "${@:2}"; }
elif command -v python3 >/dev/null; then
  make_zip() { python3 -m zipfile -c "$@"; }
else
  echo "error: neither zip nor python3 found in PATH" >&2
  exit 1
fi

OUT_DIR="${OUT_DIR:-.}"
mkdir -p "$OUT_DIR"
OUT_DIR="$(cd "$OUT_DIR" && pwd)"

list_envs() {
  pio project config --json-output \
    | jq -r '.[][0] | select(startswith("env:")) | ltrimstr("env:")'
}

package_env() {
  local env="$1"
  echo "==> $env"

  [[ -n "${SKIP_BUILD:-}" ]] || pio run -e "$env"

  # `.extra` carries the flash images and their offsets. Normally straight from
  # pio, but fall back to the build dir's cached idedata.json when pio can't run
  # (e.g. the platform isn't installable on this machine).
  local meta
  if meta="$(pio project metadata -e "$env" --json-output 2>/dev/null \
             | jq -e ".\"$env\".extra" 2>/dev/null)"; then
    :
  elif [[ -f ".pio/build/$env/idedata.json" ]]; then
    echo "    (pio project metadata failed; using cached .pio/build/$env/idedata.json)"
    meta="$(jq -e '.extra' ".pio/build/$env/idedata.json")"
  else
    echo "error: could not obtain build metadata for $env" >&2
    return 1
  fi

  local staging
  staging="$(mktemp -d)"
  trap 'rm -rf "$staging"' RETURN

  # bootloader / partitions / boot_app0, as declared by the env metadata
  local path
  while IFS= read -r path; do
    [[ -f "$path" ]] || { echo "error: missing flash image $path" >&2; return 1; }
    cp "$path" "$staging/$(basename "$path")"
  done < <(jq -r '.flash_images[].path' <<<"$meta")

  # the application itself, at .application_offset
  local app=".pio/build/$env/firmware.bin"
  [[ -f "$app" ]] || { echo "error: missing $app" >&2; return 1; }
  cp "$app" "$staging/firmware.bin"

  if [[ -n "${BASENAME_PATHS:-}" ]]; then
    jq '.flash_images |= map(.path |= sub(".*/"; ""))' <<<"$meta" >"$staging/firmware_metadata.json"
  else
    jq '.' <<<"$meta" >"$staging/firmware_metadata.json"
  fi

  local zipfile="$OUT_DIR/firmware-$env.zip"
  rm -f "$zipfile"
  (cd "$staging" && make_zip "$zipfile" ./*)
  echo "    $zipfile"
  python3 -c 'import sys,zipfile
for i in zipfile.ZipFile(sys.argv[1]).infolist(): print(f"    {i.file_size:>9}  {i.filename}")' "$zipfile"
}

if [[ $# -eq 0 ]]; then
  echo "usage: $0 <env>... | --all" >&2
  echo "available envs:" >&2
  list_envs | sed 's/^/  /' >&2
  exit 1
fi

if [[ "$1" == "--all" ]]; then
  mapfile -t envs < <(list_envs)
else
  envs=("$@")
fi

for env in "${envs[@]}"; do
  package_env "$env"
done
