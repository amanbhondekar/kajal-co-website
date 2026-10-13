<#
.SYNOPSIS
    Resample the design masters and regenerate the case-study pages.

.DESCRIPTION
    Wraps the two steps that follow a change under Visual Assets/:

        python tools/thumbnails.py     masters -> assets/img/
        node   build.js                data + templates -> work/, portfolio, index

    Runs from anywhere — it locates the repo from its own path — and stops
    before the build if the image step fails, so a bad export cannot leave
    half-regenerated pages behind. Re-running with nothing changed is a no-op.

.PARAMETER ImagesOnly
    Skip the build. Enough when only a master changed, since image paths are
    already baked into the generated HTML.

.EXAMPLE
    .\tools\rebuild.ps1

.EXAMPLE
    .\tools\rebuild.ps1 -ImagesOnly

.NOTES
    "running scripts is disabled on this system" means PowerShell's execution
    policy is Restricted, which is the Windows default. Either run it as

        powershell -ExecutionPolicy Bypass -File .\tools\rebuild.ps1

    or allow local scripts once, for your account only:

        Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
#>
[CmdletBinding()]
param(
    [switch] $ImagesOnly
)

$repo = Split-Path -Parent $PSScriptRoot

function Assert-Command {
    param([string] $Name, [string] $Hint)
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        Write-Host "'$Name' is not on PATH. $Hint" -ForegroundColor Red
        exit 1
    }
}

Assert-Command -Name 'python' -Hint 'Install Python 3, then: pip install Pillow'
if (-not $ImagesOnly) {
    Assert-Command -Name 'node' -Hint 'Install Node.js to run build.js.'
}

Push-Location $repo
try {
    Write-Host "`n== images ==" -ForegroundColor Cyan
    python tools/thumbnails.py
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`nImage step failed - pages left untouched." -ForegroundColor Red
        exit $LASTEXITCODE
    }

    if ($ImagesOnly) {
        Write-Host "`nImages done. Skipped the build (-ImagesOnly)." -ForegroundColor Green
        exit 0
    }

    Write-Host "`n== pages ==" -ForegroundColor Cyan
    node build.js
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`nBuild failed." -ForegroundColor Red
        exit $LASTEXITCODE
    }

    Write-Host "`nDone. Review with: git status" -ForegroundColor Green
}
finally {
    Pop-Location
}
