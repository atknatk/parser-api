# Node.js temel imajını kullan
FROM node:20-alpine

# Çalışma dizinini ayarla
WORKDIR /app

# package.json ve package-lock.json dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm install

# Tüm proje dosyalarını kopyala
COPY . .

# Uygulamanın çalışacağı port
EXPOSE 3000

# Uygulamayı başlat
CMD ["npm", "run", "start"]
