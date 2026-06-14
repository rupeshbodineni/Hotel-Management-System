from fastapi import Request
from fastapi.responses import JSONResponse


PUBLIC_ROUTES = [
    "/docs",
    "/redoc",
    "/openapi.json",
    "/users/login",
    "/users/register"
]


async def auth_middleware(request: Request, call_next):

    if request.url.path in PUBLIC_ROUTES:
        return await call_next(request)

    token = request.headers.get("Authorization")

    if not token:
        return JSONResponse(
            status_code=401,
            content={
                "success": False,
                "message": "Authorization token missing"
            }
        )

    response = await call_next(request)
    return response