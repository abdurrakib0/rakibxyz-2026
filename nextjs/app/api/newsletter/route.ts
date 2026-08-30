import { NextRequest, NextResponse } from 'next/server';
import { saveNewsletterSubscriber } from '@/lib/data';
import { validateEmail } from '@/lib/email-validator';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const validation = validateEmail(email);

    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, message: validation.error || 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const cleanEmail = validation.cleanEmail || String(email).trim().toLowerCase();

    const saveResult = await saveNewsletterSubscriber(cleanEmail);
    return NextResponse.json(saveResult);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
