# Use a specific platform to avoid "exec format" issues on Apple M1/M2 or mismatched hosts
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install


COPY . .
RUN npm run build


FROM nginx:alpine


COPY --from=build /app/dist /usr/share/nginx/html


# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80


CMD ["nginx", "-g", "daemon off;"]
