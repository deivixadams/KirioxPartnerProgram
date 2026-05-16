import { NextResponse } from 'next/server';
import { VendorsService } from '@/lib/services/vendors.service';

export async function GET() {
  try {
    const vendors = await VendorsService.findAll();
    return NextResponse.json(vendors);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const vendor = await VendorsService.create(body);
    return NextResponse.json(vendor);
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
      return NextResponse.json({ error: 'Missing vendor id' }, { status: 400 });
    }
    if (isNaN(percentage)) {
      return NextResponse.json({ error: 'Invalid percentage' }, { status: 400 });
    }

    const vendor = await VendorsService.updateCommission(id, percentage);
    return NextResponse.json(vendor);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
