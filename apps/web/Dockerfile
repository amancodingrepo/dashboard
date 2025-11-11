FROM node:18-alpine
WORKDIR /usr/src/app

# Install deps
COPY package*.json ./
RUN npm install --production=false

# Copy source
COPY . .

# Accept build arg for API URL
ARG NEXT_PUBLIC_API_URL=http://localhost:4001
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build production
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start"]
