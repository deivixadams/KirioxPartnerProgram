import { NextResponse } from 'next/server';
import { PartnersService } from '@/lib/services/partners.service';

export async function GET() {
  try {
    const partners = await PartnersService.findAll();
    return NextResponse.json(partners);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const partner = await PartnersService.create(body);
    return NextResponse.json(partner);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const id = body.id;
    const percentage = Number(body.percentage);

    if (!id) {
      return NextResponse.json({ error: 'Missing partner id' }, { status: 400 });
    }
    if (isNaN(percentage)) {
      return NextResponse.json({ error: 'Invalid percentage' }, { status: 400 });
    }

    const partner = await PartnersService.updateCommission(id, percentage);
    return NextResponse.json(partner);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
