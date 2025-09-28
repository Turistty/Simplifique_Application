import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const auth = req.cookies.get("auth")?.value;

  // rotas protegidas
  const protectedRoutes = ["/user", "/rewards", "/admin"];
  const isProtected = protectedRoutes.some((p) =>
    req.nextUrl.pathname.startsWith(p)
  );

  if (isProtected && !auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

// Ajuste os caminhos onde o middleware atua
export const config = {
  matcher: ["/user/:path*", "/rewards/:path*", "/admin/:path*"],
};
// O middleware agora protege as rotas /user, /rewards e /admin
// e redireciona para a página de login se o cookie "auth" não estiver presente.