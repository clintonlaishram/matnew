import { NextResponse } from "next/server";

const TELEGRAM_API_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

export async function POST(req: Request) {
  try {
    const { name, message } = await req.json(); // Get name and message from the request body

    // Send the Telegram message
    const response = await fetch(TELEGRAM_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID, // Your Telegram Chat ID
        text: `New Form Submission:\n\nName: ${name}\nMessage: ${message}`,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Telegram API Error:", errorText);
      return NextResponse.json(
        { success: false, error: errorText },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Notification sent to Telegram." });
  } catch (error) {
    console.error("Error in Telegram API:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
