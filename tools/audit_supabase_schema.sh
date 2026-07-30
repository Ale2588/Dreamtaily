#!/usr/bin/env bash
set -euo pipefail

echo "DreamTaily — audit schema Supabase"
echo

if ! command -v supabase >/dev/null 2>&1; then
  echo "ERRORE: Supabase CLI non trovata."
  echo "Installa la CLI e riprova."
  exit 1
fi

read -r -p "PROJECT_REF Supabase: " PROJECT_REF
if [[ -z "${PROJECT_REF}" ]]; then
  echo "ERRORE: PROJECT_REF mancante."
  exit 1
fi

echo
echo "1/3 Login Supabase"
supabase login

echo
echo "2/3 Collegamento progetto"
supabase link --project-ref "${PROJECT_REF}"

echo
echo "3/3 Estrazione schema remoto"
supabase db pull

echo
echo "DB pull completato."
echo "Controlla il nuovo file in supabase/migrations/."
echo "Poi esegui supabase/audit/verify_schema.sql nel SQL Editor."
