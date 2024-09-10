# Base image.
FROM node:18-alpine
# Set the Enviournment to production
ENV NODE_ENVIRONMENT=staging
# Create app directory.
WORKDIR /usr/src/app
# A wildcard is used to copy package.json AND package-lock.json.
COPY package*.json ./

RUN npm install -g @nestjs/cli

RUN npm install

COPY . .

RUN npm run build

EXPOSE 8000

CMD [ "node", "dist/main.js" ]