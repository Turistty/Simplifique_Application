import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {jwtVerify} from 'jose';

const secret = new TextEncoder().encode(process.env.Jwt_secret); //HS256

const PROTECTED_PATHS = ['/user', 'admin', '/rewards']; //IMPORTANTE - ADICIONAR TODAS ROTAS PRIVADAS PARA PROTEÇÃO

export async function middleware(req: NextRequest){
    const {pathname} = req.nextUrl;

    const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
    if (!isProtected){
        return NextResponse.next();
    }

    const token = req.cookies.get('acess_token')?.value;
    if(!token){
        //Voltar para login
        const url= req.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('from', pathname);
        return NextResponse.redirect(url);
    }

    try{
        //vaklidar JWT para garatir que não está expirado ou trocado
        await jwtVerify(token, secret);
        return NextResponse.next();
    } catch{
        //Token Invalido - Voltar login
        const url= req.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('from', pathname);
        return NextResponse.redirect(url);
        }
    }
export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|assets|public).*)'],
};