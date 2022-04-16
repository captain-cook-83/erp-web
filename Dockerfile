FROM nginx:1.15.10-alpine
ARG JAR_FILE
COPY nginx.conf /etc/nginx/nginx.conf
ADD ${JAR_FILE} /usr/share/nginx/html