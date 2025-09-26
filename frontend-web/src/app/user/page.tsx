import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
import UserClient from './UserClient';


const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export const dynamic = 'force-dynamic';

export default async function UserPage(){

  const cookieStore = cookies();
  const token = (await cookieStore).get('acess_token')?.value;
  if(!token) {redirect('/login');
}
  try{
    const { payload } = await jwtVerify(token,secret);
    
    const nome = 
     typeof payload.name === 'string' 
     ? payload.name: typeof (payload as any).nome === 'string'
     ? ((payload as any).nome as string): 'Usuário';
    
     return <UserClient serverUser={{ nome }} />;
  }catch{
    redirect('/login');
  }
}

