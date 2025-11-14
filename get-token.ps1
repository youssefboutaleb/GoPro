# Get Authentication Token Script
# Retrieves an access token from Keycloak for API authentication

param(
    [string]$Username = "admin",
    [string]$Password = "admin",
    [string]$ClientId = "medico-backend",
    [string]$ClientSecret = "secret",
    [switch]$UseServiceAccount = $false,
    [string]$KeycloakUrl = "http://localhost:8080",
    [string]$Realm = "medico"
)

$ErrorActionPreference = "Stop"

Write-Host "`n=== Getting Authentication Token ===" -ForegroundColor Cyan

# Check if Keycloak is accessible
Write-Host "`n[1/3] Checking Keycloak..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-WebRequest -Uri "$KeycloakUrl/realms/$Realm" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✓ Keycloak is accessible" -ForegroundColor Green
} catch {
    Write-Host "✗ Cannot connect to Keycloak at $KeycloakUrl" -ForegroundColor Red
    Write-Host "  Make sure services are running: .\start-services.ps1" -ForegroundColor Yellow
    exit 1
}

# Build token request
$tokenUrl = "$KeycloakUrl/realms/$Realm/protocol/openid-connect/token"

Write-Host "`n[2/3] Requesting token..." -ForegroundColor Yellow

try {
    # Build form-encoded body manually for better compatibility
    if ($UseServiceAccount) {
        Write-Host "  Using client credentials (service account) grant..." -ForegroundColor Gray
        $bodyParams = @(
            "grant_type=client_credentials",
            "client_id=$ClientId",
            "client_secret=$ClientSecret"
        )
    } else {
        Write-Host "  Using password grant for user: $Username" -ForegroundColor Gray
        $bodyParams = @(
            "grant_type=password",
            "client_id=$ClientId",
            "client_secret=$ClientSecret",
            "username=$Username",
            "password=$Password"
        )
    }
    $bodyString = $bodyParams -join "&"
    
    # Create HTTP request manually for better error handling
    $request = [System.Net.HttpWebRequest]::Create($tokenUrl)
    $request.Method = "POST"
    $request.ContentType = "application/x-www-form-urlencoded"
    $request.Timeout = 30000
    
    # Write body
    $requestStream = $request.GetRequestStream()
    $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($bodyString)
    $requestStream.Write($bodyBytes, 0, $bodyBytes.Length)
    $requestStream.Close()
    
    # Get response
    try {
        $response = $request.GetResponse()
        $responseStream = $response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($responseStream)
        $responseBody = $reader.ReadToEnd()
        $reader.Close()
        $responseStream.Close()
        $response.Close()
        
        $tokenData = $responseBody | ConvertFrom-Json
        $accessToken = $tokenData.access_token
        
        if ($accessToken) {
            Write-Host "✓ Token obtained successfully" -ForegroundColor Green
        } else {
            throw "No access_token in response"
        }
    } catch [System.Net.WebException] {
        $errorResponse = $_.Exception.Response
        $errorStream = $errorResponse.GetResponseStream()
        $errorReader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $errorReader.ReadToEnd()
        $errorReader.Close()
        $errorStream.Close()
        
        Write-Host "✗ Token request failed (HTTP $([int]$errorResponse.StatusCode))" -ForegroundColor Red
        Write-Host "  Error: $errorBody" -ForegroundColor Red
        
        # Try fallback to service account if user auth failed
        if (-not $UseServiceAccount -and $errorResponse.StatusCode -eq 401) {
            Write-Host "`n  Attempting fallback to service account..." -ForegroundColor Yellow
            $UseServiceAccount = $true
            $bodyParams = @(
                "grant_type=client_credentials",
                "client_id=$ClientId",
                "client_secret=$ClientSecret"
            )
            $bodyString = $bodyParams -join "&"
            
            $request = [System.Net.HttpWebRequest]::Create($tokenUrl)
            $request.Method = "POST"
            $request.ContentType = "application/x-www-form-urlencoded"
            $request.Timeout = 30000
            
            $requestStream = $request.GetRequestStream()
            $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($bodyString)
            $requestStream.Write($bodyBytes, 0, $bodyBytes.Length)
            $requestStream.Close()
            
            try {
                $response = $request.GetResponse()
                $responseStream = $response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($responseStream)
                $responseBody = $reader.ReadToEnd()
                $reader.Close()
                $responseStream.Close()
                $response.Close()
                
                $tokenData = $responseBody | ConvertFrom-Json
                $accessToken = $tokenData.access_token
                
                if ($accessToken) {
                    Write-Host "✓ Token obtained using service account" -ForegroundColor Green
                } else {
                    throw "No access_token in response"
                }
            } catch {
                Write-Host "✗ Service account fallback also failed" -ForegroundColor Red
                exit 1
            }
        } else {
            exit 1
        }
    }
} catch {
    Write-Host "✗ Failed to get token: $_" -ForegroundColor Red
    exit 1
}

# Save token to file
Write-Host "`n[3/3] Saving token..." -ForegroundColor Yellow
$tokenFile = "access-token.txt"
$accessToken | Out-File -FilePath $tokenFile -Encoding utf8 -NoNewline
Write-Host "✓ Token saved to: $tokenFile" -ForegroundColor Green

# Display token info
Write-Host "`n=== Token Information ===" -ForegroundColor Cyan
Write-Host "Token (first 50 chars): $($accessToken.Substring(0, [Math]::Min(50, $accessToken.Length)))..." -ForegroundColor Gray
Write-Host "Token length: $($accessToken.Length) characters" -ForegroundColor Gray
Write-Host "Token file: $tokenFile" -ForegroundColor Gray

Write-Host "`n=== Usage ===" -ForegroundColor Cyan
Write-Host "To use this token in API calls:" -ForegroundColor Yellow
Write-Host "  `$token = Get-Content access-token.txt" -ForegroundColor White
Write-Host "  Invoke-WebRequest -Uri 'http://localhost:8081/profiles' \`" -ForegroundColor White
Write-Host "    -Headers @{Authorization=`"Bearer `$token`"}" -ForegroundColor White
Write-Host "`nOr use Swagger UI:" -ForegroundColor Yellow
Write-Host "  1. Open: http://localhost:8081/q/swagger-ui" -ForegroundColor White
Write-Host "  2. Click 'Authorize' button" -ForegroundColor White
Write-Host "  3. Paste token from $tokenFile" -ForegroundColor White
Write-Host ""

