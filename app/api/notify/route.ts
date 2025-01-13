import { NextResponse } from "next/server";

const WHATSAPP_API_URL = `https://graph.facebook.com/v21.0/567396246447052/messages`;

export async function POST(req: Request) {
  try {
    const { name } = await req.json(); // Use this if you want dynamic customization

    // Sending WhatsApp message
    const response = await fetch(WHATSAPP_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer EAAGeDf9xIzYBO9923hDC2REHFwinZALsWI65mv4FYRnFsBoPjThZAPYdsAjG7fGgRDlY8ZCZCHGxxeiDhTZC4oKTbwzlZAHgVQ1Dp0YrBIJZBPZAk6aanLf39TbbkhyUud7yZCyJ5r4zY4B6BgvKrrxlvgo2sZBiKIM5FApBY8r0TBmi8TlzQqCXRun8x4uYE8z4nXQA5m5FaBOTWQ8uJZAp5jVUnyBqeAZD`, // Use your valid token here
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: "916009861266", // Target phone number
        type: "text", // Use text message type for custom messages
        text: {
          body: "Hi Mateng", // The custom message
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("WhatsApp API Error:", errorText);
      return NextResponse.json(
        { success: false, error: errorText },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Notification sent." });
  } catch (error) {
    console.error("Error in Notification API:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
