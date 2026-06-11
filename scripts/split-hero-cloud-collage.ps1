# Splits default_cloud_images_collage.webp into three 5:2 hero slideshow images.
# Uses ffmpeg only (no Python/pip). Run from repo root:
#   pwsh -File scripts/split-hero-cloud-collage.ps1
#
# Source: 1920x1920 collage — three equal horizontal bands (Hero Image 1/2/3).
# Output: 2000x800 px WebP per spec (5:2 landscape, center-cropped safe zone).

$ErrorActionPreference = "Stop"

$base = Join-Path $PSScriptRoot "..\public\images\hero_section" | Resolve-Path
$input = Join-Path $base "default_cloud_images_collage.webp"
$outDir = $base

if (-not (Test-Path -LiteralPath $input)) {
    throw "Missing collage: $input"
}

$ff = Get-Command ffmpeg -ErrorAction SilentlyContinue
if (-not $ff) {
    throw "ffmpeg not found on PATH. Install ffmpeg or add it to PATH."
}

# Per-strip: extract band, center-crop to 5:2, scale to 2000x800
$stripHeight = 640
$outputs = @(
    @{ Name = "default_cloud_hero_image_1.webp"; Y = 0 },
    @{ Name = "default_cloud_hero_image_2.webp"; Y = 640 },
    @{ Name = "default_cloud_hero_image_3.webp"; Y = 1280 }
)

foreach ($item in $outputs) {
    $out = Join-Path $outDir $item.Name
    $vf = "crop=1920:${stripHeight}:0:$($item.Y),crop=1600:${stripHeight}:160:0,scale=2000:800:flags=lanczos"

    & ffmpeg -y -i $input -vf $vf -frames:v 1 -c:v libwebp -quality 90 $out 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "ffmpeg failed for $($item.Name) with exit $LASTEXITCODE"
    }
    Write-Host "Wrote $out (2000x800, 5:2)"
}

Write-Host "Done: 3 hero slideshow images at $outDir"
