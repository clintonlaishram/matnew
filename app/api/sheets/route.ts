import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  try {
    console.log("API Route Triggered");

    // Initialize Google Auth
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    // Initialize Google Sheets API
    const sheets = google.sheets({ version: "v4", auth });

    // Spreadsheet and range details
    const spreadsheetId = process.env.GOOGLE_SHEET_ID; // Google Sheet ID from environment variables
    const range = "Sheet3!A1:J"; // Updated range to include column J

    console.log("Fetching data from Google Sheets...");
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    // Ensure data is present in the response
    if (!response.data.values) {
      console.warn("No data found in the Google Sheet.");
      return NextResponse.json(
        { error: "No data found in the Google Sheet" },
        { status: 404 }
      );
    }

    console.log("Data fetched successfully:", response.data.values);
    return NextResponse.json({ data: response.data.values });
  } catch (error: any) {
    console.error("Error in API Route:", error.message || error);
    return NextResponse.json(
      {
        error: "Failed to fetch data from Google Sheets",
        details: error.message || String(error),
      },
      { status: 500 }
    );
  }
}
