// middleware.ts
export { default } from "next-auth/middleware";

export const config = {
  // List all routes that require login here
  matcher: [
    "/dashboard/:path*",
    "/todos/:path*",
    "/habits/:path*",
    "/workouts/:path*",
    "/insights/:path*",
    "/coding/:path*",
    "/settings/:path*",
    "/tasks/:path*"
  ]
};