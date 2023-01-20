FROM node:alpine

WORKDIR /usr/src/app


COPY package*.json ./

# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . . 
RUN npm install

EXPOSE 3000