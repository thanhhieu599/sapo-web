<#
  DO TOC DO WEBSITE trangthietbi.vn bang PowerShell
  ---------------------------------------------------
  Phan 1 - Do nhanh tu may cua anh: thoi gian may chu phan hoi (TTFB), tai xong HTML, dung luong HTML,
           dem so file CSS/JS/anh va dung luong JavaScript viet lien trong HTML.
  Phan 2 - Goi Google PageSpeed Insights (giong pagespeed.web.dev): diem hieu suat, FCP, LCP, TBT, CLS,
           Speed Index cho Di dong va May tinh + so lieu KHACH THAT (neu Google co du du lieu).
  Ket qua luu ra file CSV (mo bang Excel) de so sanh truoc/sau.

  CACH CHAY (Windows):
    1. Luu file nay thanh do-toc-do.ps1 (vi du vao thu muc Downloads)
    2. Mo PowerShell, chay:
         cd $HOME\Downloads
         powershell -ExecutionPolicy Bypass -File .\do-toc-do.ps1
    Do nhieu trang:
         powershell -ExecutionPolicy Bypass -File .\do-toc-do.ps1 -Urls "https://trangthietbi.vn/","https://trangthietbi.vn/bao-ho-lao-dong"
    Co API key (khuyen dung, tranh bi Google tu choi vi qua nhieu lan goi):
         powershell -ExecutionPolicy Bypass -File .\do-toc-do.ps1 -ApiKey "AIza...."
    Chi do nhanh, bo qua PageSpeed:
         powershell -ExecutionPolicy Bypass -File .\do-toc-do.ps1 -BoQuaPageSpeed
#>
param(
  [string[]]$Urls = @('https://trangthietbi.vn/'),
  [string]$ApiKey = '',
  [int]$SoLanDoNhanh = 3,
  [switch]$BoQuaPageSpeed
)

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Add-Type -AssemblyName System.Net.Http

function Get-Rating([double]$v, [double]$good, [double]$poor) {
  if ($v -le $good) { return 'TOT' } elseif ($v -le $poor) { return 'CAN CAI THIEN' } else { return 'KEM' }
}

# ---------------- PHAN 1: DO NHANH ----------------
function Measure-Quick([string]$url, [int]$n) {
  $handler = New-Object System.Net.Http.HttpClientHandler
  $handler.AutomaticDecompression = [System.Net.DecompressionMethods]::GZip -bor [System.Net.DecompressionMethods]::Deflate
  $client = New-Object System.Net.Http.HttpClient($handler)
  $client.Timeout = [TimeSpan]::FromSeconds(60)
  $client.DefaultRequestHeaders.UserAgent.ParseAdd('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0 Safari/537.36')
  $rows = @()
  $html = ''
  for ($i = 1; $i -le $n; $i++) {
    $sw = [Diagnostics.Stopwatch]::StartNew()
    $req = New-Object System.Net.Http.HttpRequestMessage([System.Net.Http.HttpMethod]::Get, $url)
    $resp = $client.SendAsync($req, [System.Net.Http.HttpCompletionOption]::ResponseHeadersRead).GetAwaiter().GetResult()
    $ttfb = $sw.Elapsed.TotalMilliseconds
    $bytes = $resp.Content.ReadAsByteArrayAsync().GetAwaiter().GetResult()
    $total = $sw.Elapsed.TotalMilliseconds
    if ($i -eq 1) { $html = [Text.Encoding]::UTF8.GetString($bytes) }
    $rows += [pscustomobject]@{
      Lan          = $i
      HTTP         = [int]$resp.StatusCode
      TTFB_ms      = [math]::Round($ttfb)
      DanhGia_TTFB = Get-Rating $ttfb 800 1800
      TaiHTML_ms   = [math]::Round($total)
      HTML_KB      = [math]::Round($bytes.Length / 1024, 1)
    }
    $resp.Dispose()
    Start-Sleep -Milliseconds 500
  }
  $client.Dispose()

  # Phan tich HTML
  $css    = ([regex]::Matches($html, '<link[^>]+stylesheet', 'IgnoreCase')).Count
  $jsFile = ([regex]::Matches($html, '<script[^>]+src=', 'IgnoreCase')).Count
  $img    = ([regex]::Matches($html, '<img\b', 'IgnoreCase')).Count
  $inline = 0
  foreach ($m in [regex]::Matches($html, '<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)</script>', 'IgnoreCase')) { $inline += $m.Groups[1].Value.Length }
  $lazy   = ([regex]::Matches($html, 'loading="lazy"', 'IgnoreCase')).Count
  $loader = ([regex]::Matches($html, 'loaders\.svg', 'IgnoreCase')).Count

  $info = [pscustomobject]@{
    So_file_CSS             = $css
    So_file_JS              = $jsFile
    So_the_anh              = $img
    Anh_co_lazy             = $lazy
    Anh_dung_loaders_svg    = $loader
    JS_viet_lien_trong_HTML = ('{0} KB' -f [math]::Round($inline / 1024, 1))
  }
  return @{ Rows = $rows; Info = $info }
}

# ---------------- PHAN 2: GOOGLE PAGESPEED ----------------
function Invoke-PSI([string]$url, [string]$strategy) {
  $base = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=' + [uri]::EscapeDataString($url) +
          '&strategy=' + $strategy + '&category=performance'
  if ($ApiKey) { $base += '&key=' + $ApiKey }
  # Chi lay cac truong can thiet (tranh loi JSON qua lon tren Windows PowerShell 5.1)
  $fields = '&fields=' + [uri]::EscapeDataString('lighthouseResult(categories/performance/score,audits(first-contentful-paint/numericValue,largest-contentful-paint/numericValue,total-blocking-time/numericValue,cumulative-layout-shift/numericValue,speed-index/numericValue,total-byte-weight/numericValue,server-response-time/numericValue)),loadingExperience/metrics')
  $r = $null
  foreach ($u in @(($base + $fields), $base)) {
    try { $r = Invoke-RestMethod -Uri $u -TimeoutSec 180; break }
    catch { $last = $_.Exception.Message }
  }
  if (-not $r) { Write-Warning ("PageSpeed loi (" + $strategy + "): " + $last + "  -> Neu loi 429: tao API key (xem cuoi file) va chay lai voi -ApiKey"); return $null }

  $a = $r.lighthouseResult.audits
  $sec = { param($x) [math]::Round($x / 1000, 1) }
  $o = [ordered]@{
    Ngay        = (Get-Date -Format 'yyyy-MM-dd HH:mm')
    Trang       = $url
    ThietBi     = $(if ($strategy -eq 'mobile') { 'Di dong' } else { 'May tinh' })
    Diem        = [math]::Round($r.lighthouseResult.categories.performance.score * 100)
    FCP_s       = & $sec $a.'first-contentful-paint'.numericValue
    LCP_s       = & $sec $a.'largest-contentful-paint'.numericValue
    TBT_ms      = [math]::Round($a.'total-blocking-time'.numericValue)
    CLS         = [math]::Round($a.'cumulative-layout-shift'.numericValue, 3)
    SpeedIndex_s= & $sec $a.'speed-index'.numericValue
    MayChu_ms   = [math]::Round($a.'server-response-time'.numericValue)
    TongTai_KB  = [math]::Round($a.'total-byte-weight'.numericValue / 1024)
  }
  $o['DanhGia_LCP'] = Get-Rating ($a.'largest-contentful-paint'.numericValue) 2500 4000
  $o['DanhGia_TBT'] = Get-Rating ($a.'total-blocking-time'.numericValue) 200 600
  $o['DanhGia_CLS'] = Get-Rating ($a.'cumulative-layout-shift'.numericValue) 0.1 0.25

  # So lieu khach that 28 ngay (Chrome UX Report) - chi co khi trang du luot truy cap
  $f = $r.loadingExperience.metrics
  if ($f -and $f.LARGEST_CONTENTFUL_PAINT_MS) {
    $o['KhachThat_LCP_s'] = [math]::Round($f.LARGEST_CONTENTFUL_PAINT_MS.percentile / 1000, 1)
    $o['KhachThat_LCP']   = $f.LARGEST_CONTENTFUL_PAINT_MS.category
    if ($f.INTERACTION_TO_NEXT_PAINT) { $o['KhachThat_INP_ms'] = $f.INTERACTION_TO_NEXT_PAINT.percentile }
    if ($f.CUMULATIVE_LAYOUT_SHIFT_SCORE) { $o['KhachThat_CLS'] = [math]::Round($f.CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile / 100, 2) }
  } else {
    $o['KhachThat_LCP_s'] = 'Chua du du lieu'
  }
  return [pscustomobject]$o
}

# ---------------- CHAY ----------------
$all = @()
foreach ($url in $Urls) {
  Write-Host ''
  Write-Host ('==================== ' + $url + ' ====================') -ForegroundColor Cyan
  Write-Host ('[1] Do nhanh tu may cua anh (' + $SoLanDoNhanh + ' lan)...') -ForegroundColor Yellow
  try {
    $q = Measure-Quick $url $SoLanDoNhanh
    $q.Rows | Format-Table -AutoSize
    $avg = ($q.Rows | Measure-Object -Property TTFB_ms -Average).Average
    Write-Host ('    TTFB trung binh: ' + [math]::Round($avg) + ' ms  (' + (Get-Rating $avg 800 1800) + ')')
    Write-Host '    Phan tich HTML:' -ForegroundColor Yellow
    $q.Info | Format-List
  } catch { Write-Warning ('Do nhanh loi: ' + $_.Exception.Message) }

  if (-not $BoQuaPageSpeed) {
    foreach ($s in @('mobile', 'desktop')) {
      Write-Host ('[2] Google PageSpeed - ' + $(if ($s -eq 'mobile') { 'Di dong' } else { 'May tinh' }) + ' (30-60 giay)...') -ForegroundColor Yellow
      $p = Invoke-PSI $url $s
      if ($p) { $p | Format-List; $all += $p }
    }
  }
}

if ($all.Count -gt 0) {
  $file = Join-Path (Get-Location) ('ket-qua-toc-do-' + (Get-Date -Format 'yyyyMMdd-HHmm') + '.csv')
  $all | Export-Csv -Path $file -NoTypeInformation -Encoding UTF8
  Write-Host ''
  Write-Host ('Da luu ket qua: ' + $file) -ForegroundColor Green
}
Write-Host ''
Write-Host 'Nguong Google: LCP <= 2.5s TOT | TBT <= 200ms TOT | CLS <= 0.1 TOT | Diem >= 90 TOT'

<#
  TAO API KEY MIEN PHI (neu bi loi 429 - qua nhieu yeu cau):
    1. Vao https://console.cloud.google.com/ -> tao project (vi du "trangthietbi-speed")
    2. APIs & Services -> Library -> tim "PageSpeed Insights API" -> Enable
    3. APIs & Services -> Credentials -> Create credentials -> API key -> copy
    4. Chay: powershell -ExecutionPolicy Bypass -File .\do-toc-do.ps1 -ApiKey "AIza...."
#>
