FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src
COPY prisma.config.js ./
RUN npx prisma generate
RUN npm run build
EXPOSE 8080
CMD ["node", "dist/index.js"]