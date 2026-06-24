FROM node:18-alpine
WORKDIR /app

# Khắc phục lỗi thiếu thư viện Oracle Client cho Alpine linux (hoặc dùng oracledb Thin mode)
# Vì NestJS oracledb mặc định dùng Thin mode nên không cần cài instaclient trừ khi cần Thick mode

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3001
CMD ["npm", "run", "start:prod"]
