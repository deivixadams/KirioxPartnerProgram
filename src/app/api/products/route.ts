import { NextResponse } from 'next/server';
import { ProductsService } from '@/lib/services/simple.service';

export async function GET() {
  try {
    const products = await ProductsService.findAll();
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
