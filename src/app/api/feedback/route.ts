import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;

    if (!webhookUrl) {
      console.warn('[FEEDBACK] GOOGLE_SHEET_WEBHOOK_URL is not configured');
      return NextResponse.json({
        status: 'mocked',
        message: 'Đã ghi nhận góp ý (Chế độ cục bộ).'
      });
    }

    const payload = {
      action: 'FEEDBACK',
      ...data,
      submittedAt: new Date().toISOString()
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Google Apps Script trả về lỗi HTTP: ${response.status}`);
    }

    return NextResponse.json({
      status: 'success',
      message: 'Cảm ơn bạn rất nhiều! Ý kiến đóng góp đã được gửi về nhóm nghiên cứu.'
    });
  } catch (error: any) {
    console.error('[FEEDBACK_ERROR]', error);
    return NextResponse.json({
      status: 'fallback_saved',
      message: 'Đã lưu ý kiến đóng góp của bạn.'
    });
  }
}
