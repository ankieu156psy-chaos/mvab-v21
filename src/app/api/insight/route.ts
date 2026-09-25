import { NextResponse } from 'next/server';
import { PREBUILT_INSIGHTS } from '@/lib/insights-prebuilt';
import { Dimension } from '@/types';

export async function POST(req: Request) {
  try {
    const { dimension, scores } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    const fallback = PREBUILT_INSIGHTS[dimension as Dimension] || PREBUILT_INSIGHTS.D1;

    // Nếu chưa cấu hình API Key, trả về bản Insight viết sẵn ngay lập tức
    if (!apiKey) {
      return NextResponse.json({
        source: 'prebuilt',
        insight: fallback
      });
    }

    // Thiết lập timeout 3.5s để chống treo giao diện
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const prompt = `Bạn là một nhà tâm lý học lâm sàng Việt Nam với 20 năm kinh nghiệm.
Nhiệm vụ: Viết nhận xét ngắn (tối đa 2 câu) cho sinh viên vừa hoàn thành trục đánh giá tâm lý ${dimension}.
Điểm số thô: ${JSON.stringify(scores)}.

QUY TẮC BẮT BUỘC:
1. KHÔNG phán xét hay dán nhãn tiêu cực.
2. Dùng ngôn ngữ nâng đỡ, khách quan: "Dữ liệu cho thấy...", "Xu hướng của bạn nghiêng về...".
3. Câu thứ 2 PHẢI kết thúc bằng dấu "..." để tạo sự tò mò (cliffhanger) khuyến khích hoàn thành bài test.
4. TUYỆT ĐỐI KHÔNG chẩn đoán bệnh lý y khoa.
5. Viết bằng tiếng Việt tinh tế, khoa học.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 120
          }
        })
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    return NextResponse.json({
      source: 'gemini',
      insight: {
        ...fallback,
        teaser: generatedText || fallback.teaser
      }
    });

  } catch (error: any) {
    console.warn('[GEMINI_FALLBACK] Chuyển sang fallback do:', error.message);
    const { dimension } = await req.json().catch(() => ({ dimension: 'D1' }));
    const fallback = PREBUILT_INSIGHTS[dimension as Dimension] || PREBUILT_INSIGHTS.D1;

    return NextResponse.json({
      source: 'fallback',
      insight: fallback
    });
  }
}
