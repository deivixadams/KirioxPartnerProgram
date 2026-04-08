import { NextResponse } from 'next/server';
import { DealsService } from '@/lib/services/deals.service';

export async function GET() {
  try {
    const deals = await DealsService.findAll();
    return NextResponse.json(deals);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const deal = await DealsService.create(body);
    return NextResponse.json(deal);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
