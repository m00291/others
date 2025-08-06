# Prompt for the password, input is hidden
$secure = Read-Host "Enter password" -AsSecureString

# Convert the SecureString to plain text
$plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
)

# Display the plain text password
Write-Host "Your password is: $plain"
$plain = $null
[System.GC]::Collect()