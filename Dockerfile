FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY packages/api ./packages/api
COPY packages/web ./packages/web

# Install dependencies
RUN npm ci

# Build web app
WORKDIR /app/packages/web
RUN npm run build

# API runs from root
WORKDIR /app

EXPOSE 3000

CMD ["npm", "start", "--workspace=@link-lock/api"]
