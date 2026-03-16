package middleware

import (
	"github.com/valyala/fasthttp"
	"strings"
)

func AuthMiddleware(next fasthttp.RequestHandler) fasthttp.RequestHandler {
	return func(ctx *fasthttp.RequestCtx) {
		ctx.Response.Header.Set("Access-Control-Allow-Origin", "*")
		ctx.Response.Header.Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		ctx.Response.Header.Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-CSRF-Token")

		if string(ctx.Method()) == "OPTIONS" {
			ctx.SetStatusCode(fasthttp.StatusOK)
			return
		}

		path := string(ctx.Path())
		if path == "/login" || path == "/" || strings.HasPrefix(path, "/public") {
			next(ctx)
			return
		}

		token := ctx.Request.Header.Peek("X-CSRF-Token")
		if len(token) == 0 {
			ctx.Error("Unauthorized: Missing Token", fasthttp.StatusUnauthorized)
			return
		}

		next(ctx)
	}
}