#!/bin/bash

# Configuration
export APPLE_ID="huyuanbo412004038@gmail.com"
export APPLE_APP_SPECIFIC_PASSWORD="zire-cdzq-eulv-wlfn"
export APPLE_TEAM_ID="STWPBZG6S7"

# Print configuration (masking password)
echo "🍎 Apple ID: $APPLE_ID"
echo "🔐 Team ID: $APPLE_TEAM_ID"
echo "📦 Building DMG for WitNote v1.2.3..."

# Run the build
# This will run `tsc && vite build && electron-builder` as defined in package.json
# electron-builder will detect the env vars for notarization
npm run build
