# Stage 1: Compile and Build angular codebase

# Use official node image as the base image
FROM node:latest as build

# Set the working directory
WORKDIR /usr/local/app

# Add the source code to app
COPY ./ /usr/local/app/

# Install all the dependencies
RUN npm install

# Generate the build of the application
RUN npm run build


# Stage 2: Serve app with nginx server

# Use official nginx image as the base image
FROM nginx:latest

# Copy the build output to replace the default nginx contents.
COPY --from=build /usr/local/app/dist/player-demo /usr/share/nginx/html
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
    }
    location /widevine/ {
        rewrite /widevine/(.*) /$1  break;
        proxy_pass https://htv-wv.mts.ru/;
        proxy_ssl_verify off;
    }
    location /playready/ {
        rewrite /playready/(.*) /$1  break;
        proxy_pass https://htv-prls.mts.ru:443/PlayReady/rightsmanager.asmx;
        proxy_ssl_verify off;
    }
}
EOF

# Expose port 80
EXPOSE 80
