# PowerShell script to prepare Hostinger public_html package

$dest = "public_html"
if (Test-Path $dest) {
    Remove-Item -Recurse -Force $dest
}
New-Item -ItemType Directory -Path $dest | Out-Null

Write-Host "Copying React frontend dist files..."
Copy-Item -Recurse "client\dist\*" $dest

Write-Host "Copying PHP API..."
Copy-Item -Recurse "api" "$dest\api"

Write-Host "Copying config..."
Copy-Item -Recurse "config" "$dest\config"

Write-Host "Copying includes..."
Copy-Item -Recurse "includes" "$dest\includes"

Write-Host "Copying .htaccess..."
Copy-Item ".htaccess" "$dest\.htaccess"

Write-Host "Copying database.sql..."
Copy-Item "database.sql" "$dest\database.sql"

Write-Host "Copying uploaded media files..."
New-Item -ItemType Directory -Path "$dest\uploads" -Force | Out-Null
if (Test-Path "server\uploads") {
    Copy-Item -Recurse "server\uploads\*" "$dest\uploads\"
}

Write-Host "Creating zip package for 1-click Hostinger upload..."
$zipPath = "nirvana_hostinger_public_html.zip"
if (Test-Path $zipPath) {
    Remove-Item -Force $zipPath
}
Compress-Archive -Path "$dest\*" -DestinationPath $zipPath -Force

Write-Host "Successfully built $dest and $zipPath!"
