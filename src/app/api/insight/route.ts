import { NextResponse } from 'next/server';
import { PREBUILT_INSIGHTS } from '@/lib/insights-prebuilt';
import { Dimension } from '@/types';

export async function POST(req: Request) {
  let dimension: Dimension = 'D1';
  let scores: Record<string, number> = {};

  try {
    const body = await req.json();
    if (body.dimension && PREBUILT_INSIGHTS[body.dimension as Dimension]) {
      dimension = body.dimension as Dimension;
    }
    scores = body.scores || {};
  } catch (e) {
    console.warn('[API_INSIGHT] Lỗi đọc body JSON, dùng D1 mặc định');
  }

  const fallback = PREBUILT_INSIGHTS[dimension] || PREBUILT_INSIGHTS.D1;
  const apiKey = process.env.GEMINI_API_KEY;

  // Nếu chưa cấu hình API Key, trả về bản Insight viết sẵn tương ứng với dimension
  if (!apiKey) {
    return NextResponse.json({
      source: 'prebuilt',
      insight: fallback
    });
  }

  try {
    // Thiết lập timeout 3s để chống treo giao diện
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const prompt = `Bạn là một nhà tâm lý học lâm sàng Việt Nam với 20 năm kinh nghiệm.
Nhiệm vụ: Viết nhận xét ngắn (tối đa 2 câu) cho sinh viên vừa hoàn thành trục đánh giá tâm lý ${dimension} (${fallback.title}).
Điểm số thô: ${JSON.stringify(scores)}.

QUY TẮC BẮT BUỘC:
1. KHÔNG phán xét hay dán nhãn tiêu cực.
2. Dùng ngôn ngữ nâng đỡ, khách quan: "Dữ liệu cho thấy...", "Xu hướng của bạn nghiêng về...".
3. Câu thứ 2 PHẢI kết thúc bằng dấu "..." để tạo sự tò mò (cliffhanger) khuyến khích hoàn thành bài test.
4. TUYỆT ĐỐI KHÔNG chẩn đoán bệnh lý y khoa.
5. Viết bằng tiếng Việt tinh tế, khoa học.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    return NextResponse.json({
      source: 'gemini',
      insight: {
        ...fallback,
        dimension,
        teaser: generatedText || fallback.teaser
      }
    });

  } catch (error: any) {
    console.warn(`[GEMINI_FALLBACK] Chuyển sang fallback cho ${dimension} do:`, error.message);
    // Luôn luôn trả về fallback của đúng dimension được gửi lên
    return NextResponse.json({
      source: 'fallback',
      insight: fallback
    });
  }
}
