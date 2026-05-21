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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, code, description, isActive } = body;

    if (!name || !code) {
      return NextResponse.json({ error: 'Name and code are required' }, { status: 400 });
    }

    const product = await ProductsService.create({
      name,
      code,
      description: description || null,
      isActive: typeof isActive === 'boolean' ? isActive : true,
    });

    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
