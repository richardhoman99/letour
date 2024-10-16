# use Node.js image
FROM node:latest

# create new project
#WORKDIR /letour-app
#CMD ["npx", "create-react-app", "letour-app"]

WORKDIR /letour-app

COPY package.json package-lock.json ./
RUN npm install

# copy source code
# COPY . .

EXPOSE 3000

CMD ["sh", "-c", "npm install && npm start"]
