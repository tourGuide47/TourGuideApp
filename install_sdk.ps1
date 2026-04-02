$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$AndroidHome = "C:\Users\USER\AppData\Local\Android\Sdk"
if (!(Test-Path $AndroidHome)) {
    New-Item -ItemType Directory -Force -Path $AndroidHome | Out-Null
}

$CmdtoolsPath = "$AndroidHome\cmdline-tools"
if (!(Test-Path $CmdtoolsPath)) {
    New-Item -ItemType Directory -Force -Path $CmdtoolsPath | Out-Null
}

$ZipPath = "$env:TEMP\commandlinetools-win-latest.zip"
Write-Host "Downloading Android SDK Command-line Tools..."
Invoke-WebRequest -Uri "https://dl.google.com/android/repository/commandlinetools-win-10406996_latest.zip" -OutFile $ZipPath -UseBasicParsing

$ExtractPath = "$env:TEMP\android_cmdline_extracted"
if (Test-Path $ExtractPath) {
    Remove-Item -Recurse -Force $ExtractPath
}
Write-Host "Extracting ZIP..."
Expand-Archive -Path $ZipPath -DestinationPath $ExtractPath -Force

$LatestDir = "$CmdtoolsPath\latest"
if (Test-Path $LatestDir) {
    Remove-Item -Recurse -Force $LatestDir
}
New-Item -ItemType Directory -Force -Path $LatestDir | Out-Null
Write-Host "Moving tools..."
Move-Item -Path "$ExtractPath\cmdline-tools\*" -Destination $LatestDir -Force

$SdkManager = "$LatestDir\bin\sdkmanager.bat"

Write-Host "Initialising SDK Manager and accepting licenses..."
# Auto accept all licenses
try { 1..100 | % { "y" } | & $SdkManager --licenses } catch {}

Write-Host "Installing necessary platforms and build-tools (This might take a while)..."
# Install platforms
& $SdkManager "platforms;android-34" "build-tools;34.0.0" "platform-tools"

Write-Host "Setting Flutter configuration..."
flutter config --android-sdk $AndroidHome
try { 1..100 | % { "y" } | flutter doctor --android-licenses } catch {}

Write-Host "Android SDK configured successfully!"
