# Builds a 1920x1080 (16:9) 2x2 mood board from R&B hero reference assets.
# Requires ffmpeg on PATH. Run from repo root:
#   pwsh -File scripts/merge-rb-hero-mood-board.ps1
#
# Layout: top Roy | Bindu, bottom Nadirshah | logo. Pad color matches hero purple.

$ErrorActionPreference = "Stop"
$base = Join-Path $PSScriptRoot "..\public\images\hero_movie_section" | Resolve-Path
$out = Join-Path $base "rb-hero-mood-board-1920x1080.png"

$inputs = @(
    (Join-Path $base "roy_only.jpg"),
    (Join-Path $base "bindu_only.jpg"),
    (Join-Path $base "Nadirshah.jpg"),
    (Join-Path $base "roy_and_bindu_prod_logo_transparent.png")
)
foreach ($p in $inputs) {
    if (-not (Test-Path -LiteralPath $p)) { throw "Missing: $p" }
}

$fc = @"
[0:v]scale=960:540:force_original_aspect_ratio=decrease,pad=960:540:(ow-iw)/2:(oh-ih)/2:color=0x1a0a2e,format=rgba[v0];
[1:v]scale=960:540:force_original_aspect_ratio=decrease,pad=960:540:(ow-iw)/2:(oh-ih)/2:color=0x1a0a2e,format=rgba[v1];
[2:v]scale=960:540:force_original_aspect_ratio=decrease,pad=960:540:(ow-iw)/2:(oh-ih)/2:color=0x1a0a2e,format=rgba[v2];
[3:v]scale=960:540:force_original_aspect_ratio=decrease,pad=960:540:(ow-iw)/2:(oh-ih)/2:color=0x1a0a2e,format=rgba[v3];
[v0][v1]hstack=inputs=2[row0];
[v2][v3]hstack=inputs=2[row1];
[row0][row1]vstack=inputs=2[out]
"@

& ffmpeg -y `
    -i $inputs[0] -i $inputs[1] -i $inputs[2] -i $inputs[3] `
    -filter_complex $fc -map "[out]" -frames:v 1 -update 1 `
    $out

if ($LASTEXITCODE -ne 0) { throw "ffmpeg failed with exit $LASTEXITCODE" }
Write-Host "Wrote $out"
