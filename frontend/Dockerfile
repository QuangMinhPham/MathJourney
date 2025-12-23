# Stage 1: Build
FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production
# ... (phần build stage bên trên giữ nguyên) ...

FROM nginx:stable-alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html

# THÊM DÒNG NÀY ĐỂ GHI ĐÈ CẤU HÌNH MẶC ĐỊNH
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]