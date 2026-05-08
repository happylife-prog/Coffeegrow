Set-Location $PSScriptRoot

$diff  = git diff --cached --name-status
$lines = $diff -split "`n" | Where-Object { $_ -match '\S' }

$adds = ($lines | Where-Object { $_ -match '^A' } | ForEach-Object { ($_ -replace '^A\s+','').Trim() })
$mods = ($lines | Where-Object { $_ -match '^M' } | ForEach-Object { ($_ -replace '^M\s+','').Trim() })
$dels = ($lines | Where-Object { $_ -match '^D' } | ForEach-Object { ($_ -replace '^D\s+','').Trim() })

$parts = @()
if ($adds) { $parts += "追加: " + ($adds -join ", ") }
if ($mods) { $parts += "変更: " + ($mods -join ", ") }
if ($dels) { $parts += "削除: " + ($dels -join ", ") }

$date = Get-Date -Format "yyyy-MM-dd HH:mm"
$msg  = ($parts -join " / ") + "  [$date]"

Write-Host ""
Write-Host "コミットメッセージ: $msg" -ForegroundColor Cyan
Write-Host ""
git commit -m $msg
Write-Host ""
Write-Host "GitHubへ Push 中..." -ForegroundColor Yellow
git push origin main
Write-Host ""
Write-Host "完了！" -ForegroundColor Green