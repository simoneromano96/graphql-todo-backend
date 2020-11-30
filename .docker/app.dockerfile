FROM node:alpine as build

WORKDIR /app

COPY . .

RUN npm i

RUN npm run build

# Remove all source map files
RUN find . -name "*.js.map" -type f -delete

# Remove generated folder
RUN rm -rf ./dist/generated

RUN ls -al ./dist

FROM node:alpine as production

ENV NODE_ENV=production

WORKDIR /app

COPY --from=build /app/package.json .

RUN npm i

COPY --from=build /app/dist ./dist

CMD [ "npm", "start" ]
