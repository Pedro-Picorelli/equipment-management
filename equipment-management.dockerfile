FROM node:22

ENV TZ=America/Sao_Paulo

WORKDIR /app

# Copia só manifestos primeiro para melhor cache
COPY package*.json ./

# Instala dependências (use 'npm ci' se tiver package-lock.json)
RUN npm ci || npm install

# Copia o restante do código
COPY . .

EXPOSE 3000

# Rode seu dev server (ou troque para 'npm run start' em prod)
CMD ["npm", "run", "dev"]
