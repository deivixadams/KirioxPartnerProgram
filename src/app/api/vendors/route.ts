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
