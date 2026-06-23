# Rakzan Database Setup Script
# Run this after setting up your Supabase project

Write-Host "=== Rakzan Al-Ufuq Database Setup ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Create .env.local file" -ForegroundColor Yellow
if (-not (Test-Path "..\..env.local")) {
  Copy-Item "..\..env.local.example" "..\..env.local"
  Write-Host "  Created .env.local from template - please update with your Supabase credentials" -ForegroundColor Green
} else {
  Write-Host "  .env.local already exists" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Step 2: Open Supabase Studio" -ForegroundColor Yellow
Write-Host "  1. Go to https://supabase.com and create/select your project"
Write-Host "  2. Open the SQL Editor"
Write-Host "  3. Copy the contents of supabase/schema.sql"
Write-Host "  4. Paste and run in SQL Editor"
Write-Host ""

Write-Host "Step 3: Configure Authentication" -ForegroundColor Yellow
Write-Host "  In Supabase Dashboard > Authentication > Settings:"
Write-Host "  - Enable Email/Password auth (disable confirm email for dev)"
Write-Host "  - Add Site URL: http://localhost:3000"
Write-Host "  - Add Redirect URLs: http://localhost:3000/auth/callback"
Write-Host ""

Write-Host "Step 4: Copy your credentials to .env.local:" -ForegroundColor Yellow
Write-Host "  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co"
Write-Host "  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key"
Write-Host ""

Write-Host "Step 5: Start development server" -ForegroundColor Yellow
Write-Host "  npm run dev"
Write-Host ""

Write-Host "=== Done ===" -ForegroundColor Cyan
