// middleware.ts
export { default } from "next-auth/middleware";

export const config = { 
  // List all routes that require login here
  matcher: ["/todos/:path*", "/habits/:path*", "/dashboard/:path*", "/stats/:path*"] 
};