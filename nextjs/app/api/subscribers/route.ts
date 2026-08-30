import { NextRequest, NextResponse } from 'next/server';
import { getSubscribersAsync, deleteSubscriberAsync, updateSubscriberAsync } from '@/lib/data';

export const dynamic = 'force-dynamic';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i;

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

export async function PATCH(req: NextRequest) {
  try {
    const { id, email } = await req.json();
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!id || !cleanEmail) {
      return NextResponse.json(
        { success: false, message: 'Subscriber ID and email are required.' },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const result = await updateSubscriberAsync(id, cleanEmail);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || 'Failed to update subscriber' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: 'Subscriber updated successfully.' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update subscriber' },
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
