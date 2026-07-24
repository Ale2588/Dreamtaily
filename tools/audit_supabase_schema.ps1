$ErrorActionPreference = "Stop"

Write-Host "DreamTaily — audit schema Supabase"
Write-Host ""

if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "ERRORE: Supabase CLI non trovata."
    Write-Host "Installa la CLI e riprova."
    exit 1
}

$ProjectRef = Read-Host "PROJECT_REF Supabase"
if ([string]::IsNullOrWhiteSpace($ProjectRef)) {
    Write-Host "ERRORE: PROJECT_REF mancante."
    exit 1
}

Write-Host ""
Write-Host "1/3 Login Supabase"
supabase login

Write-Host ""
Write-Host "2/3 Collegamento progetto"
supabase link --project-ref $ProjectRef

Write-Host ""
Write-Host "3/3 Estrazione schema remoto"
supabase db pull

Write-Host ""
Write-Host "DB pull completato."
Write-Host "Controlla il nuovo file in supabase/migrations/."
Write-Host "Poi esegui supabase/audit/verify_schema.sql nel SQL Editor."
