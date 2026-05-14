# serve_https.ps1 - Self-Signed HTTPS Server for Local Testing
$port = 8443
$certName = "NeoCareLocal"

# 1. Create Self-Signed Cert if it doesn't exist
$cert = Get-ChildItem Cert:\LocalMachine\My | Where-Object { $_.Subject -like "*CN=$certName*" } | Select-Object -First 1
if (-not $cert) {
    Write-Host "Creating Self-Signed Certificate..." -ForegroundColor Cyan
    $cert = New-SelfSignedCertificate -DnsName "localhost" -CertStoreLocation "cert:\LocalMachine\My" -FriendlyName $certName -Subject "CN=$certName"
}

$thumbprint = $cert.Thumbprint
$guid = [Guid]::NewGuid().ToString("B")

# 2. Bind Cert to Port (Requires Admin)
Write-Host "Binding Certificate to port $port..." -ForegroundColor Cyan
netsh http add sslcert ipport=0.0.0.0:$port certhash=$thumbprint appid=$guid

# 3. Simple Listener (HTTP.sys based)
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("https://localhost:$port/")
try {
    $listener.Start()
    Write-Host "HTTPS Server started at https://localhost:$port/" -ForegroundColor Green
    Write-Host "NOTE: You will see a security warning in your browser. Click 'Advanced' -> 'Proceed' to bypass." -ForegroundColor Yellow
    Write-Host "Press Ctrl+C to stop."
    
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq "/") { $urlPath = "/index.html" }
        
        $filePath = Join-Path $PSScriptRoot $urlPath.Replace("/", "\")
        
        if (Test-Path $filePath) {
            $content = [System.IO.File]::ReadAllBytes($filePath)
            $extension = [System.IO.Path]::GetExtension($filePath)
            $contentType = switch ($extension) {
                ".html" { "text/html" }
                ".css"  { "text/css" }
                ".js"   { "application/javascript" }
                ".json" { "application/json" }
                ".png"  { "image/png" }
                default { "application/octet-stream" }
            }
            
            $response.ContentType = $contentType
            $response.ContentLength64 = $content.Length
            $response.OutputStream.Write($content, 0, $content.Length)
        } else {
            $response.StatusCode = 404
        }
        $response.Close()
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    $listener.Stop()
}
