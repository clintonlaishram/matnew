import { NextResponse } from 'next/server';

const TELEGRAM_API_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

export async function POST(req: Request) {
  try {
    const { name, message } = await req.json();

    const response = await fetch(TELEGRAM_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: `New Booking:\n\nName: ${name}\n${message}`,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    return NextResponse.json({ success: true, message: 'Notification sent to Telegram.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to send notification.' }, { status: 500 });
  }
}
