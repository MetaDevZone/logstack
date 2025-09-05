# 🧪 Test Job Timestamps
# This script tests the updated job model with createdAt and updatedAt fields

$headers = @{
    "X-API-Key"    = "dynamite-dev-api-key-2025"
    "Content-Type" = "application/json"
}

$baseUrl = "http://localhost:4000"

Write-Host "🚀 Testing Job Timestamps..." -ForegroundColor Green

# Test 1: Check current jobs status
Write-Host "`n📊 1. Checking current jobs..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/admin/dynamite/jobs-status" -Method GET -Headers $headers
    Write-Host "✅ Jobs Status Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5
}
catch {
    Write-Host "❌ Error getting jobs status: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Trigger hourly job manually
Write-Host "`n⚡ 2. Triggering hourly job manually..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/admin/dynamite/run-hourly-job" -Method POST -Headers $headers
    Write-Host "✅ Hourly Job Trigger Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
}
catch {
    Write-Host "❌ Error triggering hourly job: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Check jobs status again to see timestamps
Write-Host "`n🔍 3. Checking jobs status again..." -ForegroundColor Yellow
try {
    Start-Sleep 2  # Wait a bit for job to process
    $response = Invoke-RestMethod -Uri "$baseUrl/admin/dynamite/jobs-status" -Method GET -Headers $headers
    Write-Host "✅ Updated Jobs Status with Timestamps:" -ForegroundColor Green
    
    if ($response.data) {
        if ($response.data.GetType().Name -eq "Object[]") {
            # Multiple jobs
            foreach ($job in $response.data) {
                Write-Host "`n📅 Job Date: $($job.date)" -ForegroundColor Cyan
                Write-Host "   Status: $($job.status)" -ForegroundColor White
                Write-Host "   Created: $($job.createdAt)" -ForegroundColor Green
                Write-Host "   Updated: $($job.updatedAt)" -ForegroundColor Green
                Write-Host "   Hours Count: $($job.hours.Count)" -ForegroundColor White
                
                # Show first few hours with timestamps
                $firstHours = $job.hours | Select-Object -First 3
                foreach ($hour in $firstHours) {
                    Write-Host "      Hour $($hour.hour_range): $($hour.status) (Created: $($hour.createdAt), Updated: $($hour.updatedAt))" -ForegroundColor Gray
                }
            }
        }
        else {
            # Single job
            $job = $response.data
            Write-Host "`n📅 Job Date: $($job.date)" -ForegroundColor Cyan
            Write-Host "   Status: $($job.status)" -ForegroundColor White
            Write-Host "   Created: $($job.createdAt)" -ForegroundColor Green
            Write-Host "   Updated: $($job.updatedAt)" -ForegroundColor Green
        }
    }
    else {
        Write-Host "No jobs found" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "❌ Error getting updated jobs status: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✅ Test completed!" -ForegroundColor Green
Write-Host "`n💡 Key Points about the updated Job model:" -ForegroundColor Blue
Write-Host "   • Each Job now has createdAt and updatedAt timestamps" -ForegroundColor White
Write-Host "   • Each HourJob also has createdAt and updatedAt timestamps" -ForegroundColor White
Write-Host "   • Timestamps are automatically managed by Mongoose" -ForegroundColor White
Write-Host "   • updatedAt changes whenever the job status changes" -ForegroundColor White
