$files = Get-ChildItem -Filter *.html -Recurse
foreach ($f in $files) {
    $content = Get-Content $f.FullName -Raw
    $newContent = $content -replace '(?s)\s*<div class="lang-switcher">.*?</div>\s*</div>\s*</div>', ''
    if ($content -ne $newContent) {
        Write-Host "Updated $($f.Name)"
        Set-Content -Path $f.FullName -Value $newContent -NoNewline
    }
}

$i18n = "js\i18n.js"
$content = Get-Content $i18n -Raw
$newContent = $content -replace '(?s),\s*fr:\s*\{.*\}\s*(?=\};)', ''
Set-Content -Path $i18n -Value $newContent -NoNewline
Write-Host "Updated i18n.js"
