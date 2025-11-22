#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Webhook Testing Setup${NC}\n"

# Check if ngrok is running
if lsof -Pi :4040 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${GREEN}✓ ngrok is already running${NC}"
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | grep -o 'https://[^"]*' | head -1)
    echo -e "${BLUE}Your webhook URL:${NC}"
    echo -e "${GREEN}${NGROK_URL}/api/webhooks/neynar${NC}\n"
else
    echo -e "${YELLOW}⚠ ngrok is not running${NC}"
    echo -e "Please run in a separate terminal: ${BLUE}ngrok http 3000${NC}\n"
fi

# Check if Next.js dev server is running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${GREEN}✓ Next.js dev server is running on port 3000${NC}\n"
else
    echo -e "${YELLOW}⚠ Next.js dev server is not running${NC}"
    echo -e "Please run: ${BLUE}npm run dev${NC}\n"
fi

# Offer to test the webhook
if [ ! -z "$NGROK_URL" ]; then
    echo -e "${BLUE}Testing endpoints:${NC}"
    
    echo -e "\n1. Health Check:"
    curl -s "${NGROK_URL}/api/health" | jq '.' || curl -s "${NGROK_URL}/api/health"
    
    echo -e "\n\n2. Would you like to send a test webhook? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo -e "\n${BLUE}Sending test webhook...${NC}"
        curl -X POST "${NGROK_URL}/api/webhooks/neynar" \
          -H "Content-Type: application/json" \
          -d '{
            "type": "cast.created",
            "data": {
              "author": {
                "fid": 12345,
                "username": "testuser"
              },
              "text": "Test cast from webhook testing script",
              "hash": "0xtest123abc",
              "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
            }
          }'
        echo -e "\n\n${GREEN}✓ Test webhook sent!${NC}"
        echo -e "Check your Next.js terminal for logs.\n"
    fi
fi

echo -e "${BLUE}📝 Quick Reference:${NC}"
echo -e "  - ngrok dashboard: ${GREEN}http://localhost:4040${NC}"
echo -e "  - Health endpoint: ${GREEN}${NGROK_URL}/api/health${NC}"
echo -e "  - Webhook endpoint: ${GREEN}${NGROK_URL}/api/webhooks/neynar${NC}"
echo -e "\n${YELLOW}Remember to add the webhook URL to your Neynar dashboard!${NC}\n"

