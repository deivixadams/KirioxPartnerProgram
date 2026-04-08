import { NextResponse } from 'next/server';
import { CommissionsService } from '@/lib/services/commissions.service';

export async function GET() {
  try {
    const commissions = await CommissionsService.findAll();
    return NextResponse.json(commissions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
