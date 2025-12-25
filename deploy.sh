#!/bin/bash

# Hiển thị màu sắc cho dễ nhìn
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Bat dau qua trinh trien khai he thong ===${NC}"

# 1. Cap nhat code tu GitHub
echo -e "${GREEN}>>> 1. Dang lay code moi nhat tu GitHub...${NC}"
git pull origin main

# 2. Dung va xoa cac container cu (giu lai Volume neu muon giu data, 
# nhung vi ban muon lam sach nen toi de che do restart manh)
echo -e "${GREEN}>>> 2. Dang dung cac dich vu dang chay...${NC}"
docker compose down

# 3. Build lai Frontend va Backend
# Su dung --no-cache cho frontend de dam bao CSS/JS moi nhat duoc ap dung
echo -e "${GREEN}>>> 3. Dang build lai image (No-Cache cho Frontend)...${NC}"
docker compose build --no-cache frontend
docker compose build backend

# 4. Khoi chay he thong
echo -e "${GREEN}>>> 4. Dang khoi dong cac container...${NC}"
docker compose up -d

# 5. Don dep tai nguyen thua
echo -e "${GREEN}>>> 5. Dang don dep cac Image cu de giai phong o cung...${NC}"
docker image prune -f

echo -e "${BLUE}=== Hoan tat! Truy cap mathjourney.app de kiem tra ===${NC}"
echo -e "${BLUE}Luu y: Neu giao dien chua doi, hay nhan Ctrl + F5 tren trinh duyet.${NC}"