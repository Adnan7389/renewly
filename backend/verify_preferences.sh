#!/bin/bash

# Base URL
API_URL="http://localhost:3001/api"

# Register a new user
echo "Registering new user..."
EMAIL="test_prefs_$(date +%s)@example.com"
PASSWORD="password123"
NAME="Test User"

REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\", \"name\": \"$NAME\"}")

if [[ $REGISTER_RESPONSE != *"User created successfully"* ]]; then
  echo "❌ Registration failed"
  echo $REGISTER_RESPONSE
  exit 1
fi

echo "✅ User registered successfully"

# Login to get token
echo "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  echo $LOGIN_RESPONSE
  exit 1
fi

echo "✅ Logged in successfully"

echo "Token: $TOKEN"

# Get default preferences
echo "Fetching default preferences..."
PREFS_RESPONSE=$(curl -s -X GET "$API_URL/users/preferences" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $PREFS_RESPONSE"

REMINDER_DAYS=$(echo $PREFS_RESPONSE | grep -o '"reminderDays":[0-9]*' | cut -d':' -f2)

if [ "$REMINDER_DAYS" -eq 1 ]; then
  echo "✅ Default reminder days is 1"
else
  echo "❌ Unexpected default reminder days: $REMINDER_DAYS"
  echo $PREFS_RESPONSE
  exit 1
fi

# Update preferences
echo "Updating preferences to 7 days..."
UPDATE_RESPONSE=$(curl -s -X PUT "$API_URL/users/preferences" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reminderDays": 7}')

UPDATED_DAYS=$(echo $UPDATE_RESPONSE | grep -o '"reminderDays":[0-9]*' | cut -d':' -f2)

if [ "$UPDATED_DAYS" -eq 7 ]; then
  echo "✅ Preferences updated successfully to 7 days"
else
  echo "❌ Failed to update preferences"
  echo $UPDATE_RESPONSE
  exit 1
fi

# Verify persistence
echo "Verifying persistence..."
VERIFY_RESPONSE=$(curl -s -X GET "$API_URL/users/preferences" \
  -H "Authorization: Bearer $TOKEN")

FINAL_DAYS=$(echo $VERIFY_RESPONSE | grep -o '"reminderDays":[0-9]*' | cut -d':' -f2)

if [ "$FINAL_DAYS" -eq 7 ]; then
  echo "✅ Persistence verified"
else
  echo "❌ Persistence check failed"
  echo $VERIFY_RESPONSE
  exit 1
fi

echo "🎉 All API tests passed!"
