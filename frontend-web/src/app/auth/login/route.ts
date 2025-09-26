import { NextRequest, NextResponse} from 'next/server'

export async function POST (req: NextRequest){
    try{
        const {username, password} = await req.json();

        // Chama backend Flask a partir do servidor Next.js

        const backendRes = await fetch(`${process.env.BACKEND_URL}/api/login`,{
            method: 'POST',
            headers: { 'Content-Type': 'appication/json'},
            //ESsa chamada roda o servidor, então não exponha secrets no cliente
            body: JSON.stringify({username, password}),
        });

        if(!backendRes.ok){
            const error = await backendRes.json().catch(()=>({}));
            return NextResponse.json(
                {message: error?.message || 'Credenciais Inválidas'},
                {status: 401}
            );
        }

        const {token, role, ...rest} = await backendRes.json();

        // gravar token em cokkie HttpOnly (ñ acessivel JS browser)
        const res = NextResponse.json({role, ...rest}, {status: 200});
        res.cookies.set({
            name: 'access_token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60*60, //ajuste de tempo de gravação de cookie
        });

        return res;
    } catch (err){
        return NextResponse.json({message: 'Erro no Login'}, {status: 500});
    }
}