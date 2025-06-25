# syntax=docker/dockerfile:1.4

FROM node:22-alpine AS builder

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
COPY . .

RUN --mount=type=secret,id=database_url \
    --mount=type=secret,id=database_auth_token \
    --mount=type=secret,id=base_url \
    --mount=type=secret,id=aws_ses_access_key_id \
    --mount=type=secret,id=aws_ses_secret_access_key \
    --mount=type=secret,id=aws_region \
    --mount=type=secret,id=aws_s3_access_key_id \
    --mount=type=secret,id=aws_s3_secret_access_key \
    --mount=type=secret,id=aws_s3_bucket_name \
    export DATABASE_URL="$(cat /run/secrets/database_url)" && \
    export DATABASE_AUTH_TOKEN="$(cat /run/secrets/database_auth_token)" && \
    export BASE_URL="$(cat /run/secrets/base_url)" && \
    export AWS_REGION="$(cat /run/secrets/aws_region)" \
    export AWS_SES_ACCESS_KEY_ID="$(cat /run/secrets/aws_ses_access_key_id)" && \
    export AWS_SES_SECRET_ACCESS_KEY="$(cat /run/secrets/aws_ses_secret_access_key)" && \
    export AWS_S3_ACCESS_KEY_ID="$(cat /run/secrets/aws_s3_access_key_id)" && \
    export AWS_S3_SECRET_ACCESS_KEY="$(cat /run/secrets/aws_s3_secret_access_key)" && \
    export AWS_S3_BUCKET_NAME="$(cat /run/secrets/aws_s3_bucket_name)" && \
    pnpm run build

FROM node:22-alpine

WORKDIR /app
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/build /app/build
COPY --from=builder /app/node_modules /app/node_modules
EXPOSE 3000
CMD ["node", "build/index.js"]