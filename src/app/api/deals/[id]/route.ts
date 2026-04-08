import { NextResponse } from 'next/server';
import { DealsService } from '@/lib/services/deals.service';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const { stage, changedBy, note } = await req.json();
    const updatedDeal = await DealsService.updateStage(id, stage, changedBy, note);
    return NextResponse.json(updatedDeal);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
