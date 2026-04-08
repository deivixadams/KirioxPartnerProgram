import { NextResponse } from 'next/server';
import { ClientsService } from '@/lib/services/clients.service';

export async function GET() {
  try {
    const clients = await ClientsService.findAll();
    return NextResponse.json(clients);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const client = await ClientsService.create(body);
    return NextResponse.json(client);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
