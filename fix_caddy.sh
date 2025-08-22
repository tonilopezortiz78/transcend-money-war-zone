#!/bin/bash

# Safe Caddy fix script - adds uri strip_prefix /warzone
# This only modifies the warzone section, nothing else

echo "🔧 Backing up current Caddyfile..."
sudo cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.backup.$(date +%Y%m%d_%H%M%S)

echo "📝 Current warzone section:"
grep -n -A 5 -B 2 'handle /warzone' /etc/caddy/Caddyfile

echo ""
echo "🔧 Adding 'uri strip_prefix /warzone' after line with 'handle /warzone*'..."

# Use sed to add the line after 'handle /warzone*'
sudo sed -i '/handle \/warzone\*/a\        uri strip_prefix /warzone' /etc/caddy/Caddyfile

echo ""
echo "📝 Updated warzone section:"
grep -n -A 6 -B 2 'handle /warzone' /etc/caddy/Caddyfile

echo ""
echo "🧪 Validating Caddy configuration..."
if sudo caddy validate --config /etc/caddy/Caddyfile; then
    echo "✅ Configuration is valid!"
    echo ""
    echo "🔄 Reloading Caddy..."
    sudo systemctl reload caddy
    echo "✅ Caddy reloaded successfully!"
    echo ""
    echo "🧪 Testing the warzone URL..."
    curl -I https://new.transcend.money/warzone
else
    echo "❌ Configuration is invalid! Restoring backup..."
    sudo cp /etc/caddy/Caddyfile.backup.$(date +%Y%m%d_%H%M%S) /etc/caddy/Caddyfile
    echo "❌ Backup restored. Please check the configuration manually."
fi
