import { NextRequest, NextResponse } from 'next/server';
import { getSubscribersAsync, deleteSubscriberAsync, updateSubscriberAsync } from '@/lib/data';
import { validateEmail } from '@/lib/email-validator';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const subscribers = await getSubscribersAsync();
    return NextResponse.json(
      { success: true, subscribers },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
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

    if (!id || !email) {
      return NextResponse.json(
        { success: false, message: 'Subscriber ID and email are required.' },
        { status: 400 }
      );
    }

    const validation = validateEmail(email);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, message: validation.error || 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const cleanEmail = validation.cleanEmail || String(email).trim().toLowerCase();

    const result = await updateSubscriberAsync(id, cleanEmail);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message || 'Failed to update subscriber' },
        { status: 400 }
      );
    }

    try {
      revalidatePath('/admin/subscribers', 'page');
      revalidatePath('/admin', 'page');
    } catch (_) {}

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
    const email = searchParams.get('email') || undefined;

    if (!id && !email) {
      return NextResponse.json(
        { success: false, message: 'Subscriber ID or email is required' },
        { status: 400 }
      );
    }

    const success = await deleteSubscriberAsync(id || '', email);

    try {
      revalidatePath('/admin/subscribers', 'page');
      revalidatePath('/admin', 'page');
    } catch (_) {}

    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete subscriber' },
      { status: 500 }
    );
  }
}
