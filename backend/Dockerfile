#--------Build stage---------
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm ci
COPY . .
COPY fitness_tracker.yaml ./
RUN npm run build 

#--------Runtime stage-------
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY fitness_tracker.yaml ./

ENV PORT=5000
EXPOSE 5000
CMD ["node", "dist/server.js"]
