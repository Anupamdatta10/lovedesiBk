#FROM node:12.13.0
FROM node:14.21
USER root
# Create app directory
WORKDIR /var/www/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN apt-get update && apt-get install -y redis-server
RUN npm install
# If you are building your code for production
# RUN npm ci --omit=dev
# Bundle app source
COPY . .

RUN chmod +x start.sh
RUN  npm install -g nodemon
#EXPOSE 8080
CMD [ "nodemon", "index.js" ]