import { NextRequest, NextResponse } from 'next/server';
import {
  getRecommendationsAsync,
  saveRecommendationAsync,
  updateRecommendationAsync,
  deleteRecommendationAsync,
  Recommendation,
} from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const recommendations = await getRecommendationsAsync();
    return NextResponse.json({ success: true, recommendations });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, role, company, avatarUrl, content, linkedinUrl, relation, date, sortOrder } = body;

    if (!name || !role || !content) {
      return NextResponse.json(
        { success: false, message: 'Name, role, and recommendation content are required.' },
        { status: 400 }
      );
    }

    const newRecommendation: Recommendation = {
      id: `rec_${Date.now()}`,
      name: name.trim(),
      role: role.trim(),
      company: (company || '').trim(),
      avatarUrl: (avatarUrl || '').trim(),
      content: content.trim(),
      linkedinUrl: (linkedinUrl || '').trim(),
      relation: (relation || '').trim(),
      date: (date || '').trim(),
      sortOrder: Number(sortOrder) || 0,
    };

    const result = await saveRecommendationAsync(newRecommendation);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || 'Failed to save recommendation' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, recommendation: result.data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Recommendation ID is required' },
        { status: 400 }
      );
    }

    const result = await updateRecommendationAsync(id, updates);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || 'Failed to update recommendation' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Recommendation ID is required' },
        { status: 400 }
      );
    }

    const success = await deleteRecommendationAsync(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete recommendation' },
      { status: 500 }
    );
  }
}
