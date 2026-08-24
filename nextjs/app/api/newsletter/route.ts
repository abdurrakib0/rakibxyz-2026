import { NextRequest, NextResponse } from 'next/server';
import { saveNewsletterSubscriber } from '@/lib/data';

export const dynamic = 'force-dynamic';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address (e.g. yourname@gmail.com).' },
        { status: 400 }
      );
    }

    const result = await saveNewsletterSubscriber(cleanEmail);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
