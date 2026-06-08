FROM node:20-alpine
WORKDIR /app

# Install server dependencies
COPY package*.json ./
RUN npm ci

# Install client dependencies
COPY client/package*.json ./client/
RUN npm ci --prefix client

# Copy server source
COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src
COPY prisma.config.js ./

# Copy client source
COPY client ./client

# Build server
RUN npx prisma generate
RUN npm run build

# Build client
RUN npm run build --prefix client

EXPOSE 8080
CMD ["node", "dist/index.js"]