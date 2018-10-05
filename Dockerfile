# If the node version is changed here, change it below as well
# TODO: Cannot do Alpine until apk package for awscli is found
FROM node:10-slim AS build
# FROM node:10.4 AS build
# FROM node:10.4-alpine

# git is needed npm install as node:slim image does not have git
RUN apt-get update && apt-get install -y \
    awscli \
    git \
    vim-tiny \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /dispatch
RUN mkdir dist-dispatch
COPY src/assets/favicon.ico dist-dispatch/favicon.ico
COPY package.json .

# Set build env vars used in the docker build, not used on the server
ARG AWS_ACCESS_KEY_ID=AKIAJY5VLHVOWYF5XEZQ
ARG AWS_SECRET_ACCESS_KEY=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
ARG AWS_REGION=us-east-1

# Update with a fresh set of environment variables
# and aws-exports for Cognito
# RUN aws s3 cp s3://dispatchresponse/scripts/environment-vars.txt .env
# RUN aws s3 cp s3://dispatchresponse/scripts/aws-exports.js .aws-exports.js

# Install dependencies
# RUN npm install --production
RUN npm install

# Ensure we have the system set to the correct timezone
ENV TZ 'America/New_York'
RUN echo $TZ > /etc/timezone && \
    rm /etc/localtime && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    dpkg-reconfigure -f noninteractive tzdata && \
    apt-get clean

# RUN apt-get update && apt-get install -y \
#     vim-tiny \
#   && rm -rf /var/lib/apt/lists/*

FROM node:10-slim
# FROM node:10.4
# FROM node:10.4-alpine
# FROM gcr.io/distroless/nodejs

WORKDIR /usr/src
COPY --from=build /dispatch .

ENV NODE_ENV=production

ADD . .

RUN npm run build

EXPOSE 3001
# Forward log messages to docker log collector
# RUN ln -s /dev/stdout /var/log/nginx/access.log \
    # && ln -sf /dev/stderr/ /var/log/nginx/error.log

CMD ["npm", "start"]

# To get a bash shell, run this container by issuing the following:
#
# $>  docker exec --name dispatch -it --rm dispatch bash
