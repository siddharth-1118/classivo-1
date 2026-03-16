FROM golang:1.23-alpine AS backend-builder
WORKDIR /app-backend
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ .
RUN go build -o main ./src

FROM alpine:latest
RUN apk add --no-cache ca-certificates tzdata
WORKDIR /root
COPY --from=backend-builder /app-backend/main ./main

ENV PORT=7860
EXPOSE 7860

CMD ["./main"]
