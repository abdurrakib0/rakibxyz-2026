import { NextRequest, NextResponse } from 'next/server';
import { getSubscribersAsync, deleteSubscriberAsync } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const subscribers = await getSubscribersAsync();
    return NextResponse.json({ success: true, subscribers });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch subscribers' },
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
        { success: false, message: 'Subscriber ID is required' },
        { status: 400 }
      );
    }

    const success = await deleteSubscriberAsync(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete subscriber' },
      { status: 500 }
    );
  }
}
