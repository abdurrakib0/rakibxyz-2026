import { NextRequest, NextResponse } from 'next/server';
import { saveNewsletterSubscriber } from '@/lib/data';

export const dynamic = 'force-dynamic';

const GMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!cleanEmail || !GMAIL_REGEX.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid @gmail.com address.' },
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
