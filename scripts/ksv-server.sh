#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="${KSV_PROJECT_DIR:-$(cd -- "${SCRIPT_DIR}/.." && pwd)}"
COMPOSE_FILE="${COMPOSE_FILE:-${PROJECT_DIR}/docker-compose.production.yml}"
ENV_FILE="${ENV_FILE:-${PROJECT_DIR}/.env.production}"
BACKUP_DIR="${BACKUP_DIR:-${PROJECT_DIR}/backups}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"

compose() {
  docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" "$@"
}

require_files() {
  [[ -f "${COMPOSE_FILE}" ]] || { echo "Fehlt: ${COMPOSE_FILE}" >&2; exit 1; }
  [[ -f "${ENV_FILE}" ]] || { echo "Fehlt: ${ENV_FILE}" >&2; exit 1; }
}

usage() {
  cat <<'EOF'
Verwendung: ./scripts/ksv-server.sh <aktion>

Aktionen:
  start                  Alle Produktionscontainer starten
  stop                   Container stoppen, Volumes behalten
  restart                Container neu starten
  update                 main pullen, neu bauen und starten
  status                 Containerstatus anzeigen
  logs [service]         Logs verfolgen, optional für einen Service
  config                 Compose-Konfiguration validieren
  backup                 PostgreSQL und Directus-Uploads sichern
  restore-db <datei>     PostgreSQL aus Dump wiederherstellen (destruktiv)
  help                   Diese Hilfe anzeigen

Umgebungsvariablen:
  KSV_PROJECT_DIR        Projektverzeichnis (Standard: Repository-Root)
  ENV_FILE               Pfad zur Produktionsumgebung
  BACKUP_DIR             Ziel für Backups (Standard: ./backups)
  DEPLOY_BRANCH          Update-Branch (Standard: main)
EOF
}

start() {
  compose up -d
}

stop() {
  compose stop
}

restart() {
  compose restart
}

update() {
  git -C "${PROJECT_DIR}" pull --ff-only origin "${DEPLOY_BRANCH}"
  compose up -d --build
}

status() {
  compose ps
}

logs() {
  compose logs --tail=200 -f "$@"
}

config() {
  compose config --quiet
  echo "Compose-Konfiguration ist gültig."
}

backup() {
  mkdir -p "${BACKUP_DIR}"
  umask 077

  local timestamp
  local database_backup
  local uploads_backup
  timestamp="$(date +%Y%m%d-%H%M%S)"
  database_backup="${BACKUP_DIR}/ksv-database-${timestamp}.sql"
  uploads_backup="${BACKUP_DIR}/directus-uploads-${timestamp}.tar.gz"

  compose exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB"' > "${database_backup}"
  compose exec -T directus sh -c 'tar -czf - -C /directus/uploads .' > "${uploads_backup}"

  echo "Datenbank: ${database_backup}"
  echo "Uploads:   ${uploads_backup}"
}

restore_db() {
  local backup_file="${1:-}"
  [[ -n "${backup_file}" && -f "${backup_file}" ]] || {
    echo "Bitte eine vorhandene SQL-Datei angeben." >&2
    exit 1
  }

  echo "ACHTUNG: Die Produktionsdatenbank wird vollständig gelöscht."
  echo "Backup: ${backup_file}"
  read -r -p 'Zum Fortfahren RESTORE eingeben: ' confirmation
  [[ "${confirmation}" == "RESTORE" ]] || { echo "Abgebrochen."; exit 1; }

  compose stop directus frontend caddy
  compose exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d postgres -v ON_ERROR_STOP=1 -c "DROP DATABASE \"$POSTGRES_DB\" WITH (FORCE);"'
  compose exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d postgres -v ON_ERROR_STOP=1 -c "CREATE DATABASE \"$POSTGRES_DB\" OWNER \"$POSTGRES_USER\";"'
  compose exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1' < "${backup_file}"
  compose up -d
  echo "Datenbank wiederhergestellt. Directus-Uploads müssen separat zurückgespielt werden."
}

main() {
  local action="${1:-help}"
  shift || true

  if [[ "${action}" == "help" || "${action}" == "-h" || "${action}" == "--help" ]]; then
    usage
    return 0
  fi

  require_files

  case "${action}" in
    start) start "$@" ;;
    stop) stop "$@" ;;
    restart) restart "$@" ;;
    update) update "$@" ;;
    status) status "$@" ;;
    logs) logs "$@" ;;
    config) config "$@" ;;
    backup) backup "$@" ;;
    restore-db) restore_db "$@" ;;
    *) echo "Unbekannte Aktion: ${action}" >&2; usage; exit 1 ;;
  esac
}

main "$@"
