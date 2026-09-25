import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;

    if (!webhookUrl) {
      console.warn('[SUBMIT] GOOGLE_SHEET_WEBHOOK_URL is not configured in .env.local');
      return NextResponse.json({
        status: 'mocked',
        message: 'Dữ liệu chưa được gửi vì chưa cấu hình GOOGLE_SHEET_WEBHOOK_URL trong .env.local'
      });
    }

    // Gửi data sang Google Apps Script
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Google Apps Script trả về lỗi HTTP: ${response.status}`);
    }

    return NextResponse.json({
      status: 'success',
      message: 'Đã lưu trữ dữ liệu vào Google Sheets thành công!'
    });
  } catch (error: any) {
    console.error('[SUBMIT_ERROR]', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'Không thể kết nối tới Google Sheets'
      },
      { status: 500 }
    );
  }
}
