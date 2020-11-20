FROM node:14.15.1-alpine3.10

ENV APP_ROOT /app/
# Create Directory for the Container
WORKDIR /usr/src/app
# Only copy the package.json file to work directory
COPY package.json .
# Install all Packages
RUN npm install
# Copy all other source code to work directory
ADD . /usr/src/app
# TypeScript
RUN npm run build
# Start
CMD [ "npm", "start" ]
# EXPOSE 7001