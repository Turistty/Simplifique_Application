import { NextRequest , NextResponse} from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(req: NextRequest){
    const token = req.cookies.get('access_token')?.value;
    if(!token) return NextResponse.json({message: 'Inauthorized'},{status:401});

    try{
        await jwtVerify(token, secret);
    }catch{
        return NextResponse.json ({message: 'Inauthorized'},{status:401});
    }

    //chama backend 

    const backendRes = await fetch(`${process.env.BACKEND_URL}/api/user/balances`,{
        headers: {Authorization: `Bearer $ {token}`},
    });

    if(!backendRes.ok){
        return NextResponse.json({message:'Erro ao buscar saldos'},{status: backendRes.status});
    }
    const data = await backendRes.json();
    return NextResponse.json(data);
}
