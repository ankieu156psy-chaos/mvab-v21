import { ITEMS_DATA } from './items';
import { 
  DimensionScores, 
  IERAuditResult, 
  CareerMatch, 
  ConfiguralRuleResult 
} from '@/types';

// Convert raw score to standard T-score (M=50, SD=10)
export function toTScore(raw: number, minVal: number, maxVal: number): number {
  const mean = (minVal + maxVal) / 2;
  const sd = (maxVal - minVal) / 5;
  const z = (raw - mean) / (sd || 1);
  const t = Math.round(50 + 10 * z);
  return Math.max(20, Math.min(80, t));
}

// Convert T-score to Percentile approximation
export function toPercentile(t: number): number {
  const z = (t - 50) / 10;
  const p = 1 / (1 + Math.exp(-1.654 * z));
  return Math.round(p * 100);
}

// Calculate Dimension Scores from user responses (Map of itemId -> value)
export function calculateDimensionScores(responses: Record<string, number>): DimensionScores {
  const scores = {
    d1_micro: 0, d1_meso: 0, d1_macro: 0,
    d2_ambiguity: 0,
    d3_emp: 0, d3_rel: 0, d3_tec: 0,
    d4_people: 0, d4_things: 0, d4_data: 0,
    d5_pt: 0, d5_pd: 0,
    d6_mentalizing: 0,
    d7_healthy: 0, d7_sacrifice: 0,
    d8_utility: 0, d8_efficacy: 0, d8_defense: 0
  };

  ITEMS_DATA.forEach(item => {
    let raw = responses[item.id] !== undefined ? responses[item.id] : 3;
    
    // Reverse scoring
    if (item.polarity === -1) {
      raw = (item.maxScore + 1) - raw;
    }

    // Accumulate by prefix
    if (item.id.startsWith('D1_MIC')) scores.d1_micro += raw;
    else if (item.id.startsWith('D1_MES')) scores.d1_meso += raw;
    else if (item.id.startsWith('D1_MAC')) scores.d1_macro += raw;
    else if (item.id.startsWith('D2_AMB')) scores.d2_ambiguity += raw;
    else if (item.id.startsWith('D3_EMP')) scores.d3_emp += raw;
    else if (item.id.startsWith('D3_REL')) scores.d3_rel += raw;
    else if (item.id.startsWith('D3_TEC')) scores.d3_tec += raw;
    else if (item.id.startsWith('D4_PEO')) scores.d4_people += raw;
    else if (item.id.startsWith('D4_THI')) scores.d4_things += raw;
    else if (item.id.startsWith('D4_DAT')) scores.d4_data += raw;
    else if (item.id.startsWith('D5_PT')) scores.d5_pt += raw;
    else if (item.id.startsWith('D5_PD')) scores.d5_pd += raw;
    else if (item.id.startsWith('D6_RFQ')) scores.d6_mentalizing += raw;
    else if (item.id.startsWith('D7_HEA')) scores.d7_healthy += raw;
    else if (item.id.startsWith('D7_SAC')) scores.d7_sacrifice += raw;
    else if (item.id.startsWith('D8_FUT')) scores.d8_utility += raw;
    else if (item.id.startsWith('D8_FSE')) scores.d8_efficacy += raw;
    else if (item.id.startsWith('D8_FDE')) scores.d8_defense += raw;
  });

  return {
    d1_micro: scores.d1_micro,
    d1_meso: scores.d1_meso,
    d1_macro: scores.d1_macro,
    d1_micro_t: toTScore(scores.d1_micro, 3, 15),
    d1_meso_t: toTScore(scores.d1_meso, 3, 15),
    d1_macro_t: toTScore(scores.d1_macro, 3, 15),

    d2_ambiguity: scores.d2_ambiguity,
    d2_amb_t: toTScore(scores.d2_ambiguity, 6, 30),

    d3_emp: scores.d3_emp,
    d3_rel: scores.d3_rel,
    d3_tec: scores.d3_tec,
    d3_emp_t: toTScore(scores.d3_emp, 4, 20),
    d3_rel_t: toTScore(scores.d3_rel, 4, 20),
    d3_tec_t: toTScore(scores.d3_tec, 4, 20),

    d4_people: scores.d4_people,
    d4_things: scores.d4_things,
    d4_data: scores.d4_data,
    d4_people_t: toTScore(scores.d4_people, 6, 30),
    d4_things_t: toTScore(scores.d4_things, 3, 15),
    d4_data_t: toTScore(scores.d4_data, 3, 15),

    d5_pt: scores.d5_pt,
    d5_pd: scores.d5_pd,
    d5_pt_t: toTScore(scores.d5_pt, 4, 20),
    d5_pd_t: toTScore(scores.d5_pd, 4, 20),

    d6_mentalizing: scores.d6_mentalizing,
    d6_rfq_t: toTScore(scores.d6_mentalizing, 7, 35),

    d7_healthy: scores.d7_healthy,
    d7_sacrifice: scores.d7_sacrifice,
    d7_hea_t: toTScore(scores.d7_healthy, 4, 20),
    d7_sac_t: toTScore(scores.d7_sacrifice, 4, 20),

    d8_utility: scores.d8_utility,
    d8_efficacy: scores.d8_efficacy,
    d8_defense: scores.d8_defense,
    d8_fut_t: toTScore(scores.d8_utility, 4, 20),
    d8_fse_t: toTScore(scores.d8_efficacy, 4, 20),
    d8_fde_t: toTScore(scores.d8_defense, 4, 20),
  };
}

// IER Audit check
export function auditIER(responses: Record<string, number>): IERAuditResult {
  let flags = 0;
  const details: string[] = [];

  // Check DIR 01 (Must be 1)
  if (responses['IER_DIR_01'] !== undefined && responses['IER_DIR_01'] !== 1) {
    flags++;
    details.push('Không tuân thủ câu lệnh điều hướng điểm sàn (IER_DIR_01 != 1)');
  }

  // Check DIR 02 (Must be 4)
  if (responses['IER_DIR_02'] !== undefined && responses['IER_DIR_02'] !== 4) {
    flags++;
    details.push('Không tuân thủ câu lệnh điều hướng điểm 4 (IER_DIR_02 != 4)');
  }

  // Check Inconsistency Pair
  if (responses['IER_INC_01a'] !== undefined && responses['IER_INC_01b'] !== undefined) {
    const diff = Math.abs(responses['IER_INC_01a'] - (6 - responses['IER_INC_01b']));
    if (diff > 2) {
      flags++;
      details.push(`Mâu thuẫn ngữ nghĩa nghiêm trọng giữa cặp câu đối chứng (|Δ| = ${diff} > 2)`);
    }
  }

  return {
    flags,
    details,
    status: flags === 0 ? 'valid' : flags === 1 ? 'warning' : 'invalid'
  };
}

// Career Clusters Evaluation
export function evaluateCareerClusters(s: DimensionScores): CareerMatch[] {
  const clusters: CareerMatch[] = [
    {
      id: 'cluster_1',
      name: 'Cụm 1: Tâm lý học Lâm sàng & Sức khỏe Y tế',
      legal: 'Luật KBCB 2023 & NĐ 96/2023: Bắt buộc 09 tháng thực hành bệnh viện nội trú.',
      apa: 'APA Div 12 (Clinical), 40 (Neuropsychology), 56 (Trauma), 38 (Health Psychology), 22 (Rehab)',
      desc: 'Thực hành chẩn đoán, đánh giá và can thiệp tâm lý trong môi trường y tế đa khoa, bệnh viện tâm thần hoặc trung tâm phục hồi chức năng.',
      match: Math.round(s.d1_micro_t * 0.35 + s.d3_emp_t * 0.25 + s.d3_rel_t * 0.2 + (80 - s.d5_pd_t) * 0.2)
    },
    {
      id: 'cluster_2',
      name: 'Cụm 2: Tham vấn Tâm lý & Trị liệu Ngoại trú Phi Y tế',
      legal: 'Bộ luật Dân sự: Hành nghề tự do hoặc thành lập văn phòng tham vấn tư nhân.',
      apa: 'APA Div 17 (Counseling), 29 (Psychotherapy), 32 (Humanistic), 43 (Family)',
      desc: 'Đồng hành tháo gỡ khủng hoảng đời sống, mâu thuẫn gia đình, tình yêu và phát triển tiềm năng cá nhân.',
      match: Math.round(s.d1_micro_t * 0.4 + s.d3_rel_t * 0.3 + s.d4_people_t * 0.2 + s.d5_pt_t * 0.1)
    },
    {
      id: 'cluster_3',
      name: 'Cụm 3: Tâm lý học Học đường & Can thiệp Phát triển',
      legal: 'Thông tư 20/2023/TT-BGDĐT: Mã chức danh Viên chức Tư vấn học sinh V.07.07.24.',
      apa: 'APA Div 16 (School), 53 (Child Clinical), 54 (Pediatric), 7 (Developmental)',
      desc: 'Tư vấn học đường, can thiệp sớm trẻ có nhu cầu đặc biệt (tự kỷ, ADHD), hỗ trợ kỹ năng tâm lý học đường.',
      match: Math.round(s.d1_meso_t * 0.35 + s.d1_micro_t * 0.25 + s.d4_people_t * 0.25 + s.d3_rel_t * 0.15)
    },
    {
      id: 'cluster_4',
      name: 'Cụm 4: Tâm lý Tổ chức, Doanh nghiệp & Quản trị Nhân sự (I/O)',
      legal: 'Bộ luật Lao động: Khối doanh nghiệp trong nước & FDI, đa quốc gia.',
      apa: 'APA Div 14 (SIOP - Industrial & Organizational), Div 13 (Consulting)',
      desc: 'Đào tạo và phát triển (L&D), tuyển dụng nhân tài, xây dựng văn hóa doanh nghiệp, hỗ trợ nhân viên (EAP).',
      match: Math.round(s.d1_meso_t * 0.4 + s.d4_people_t * 0.3 + 55 * 0.15 + s.d8_fut_t * 0.15)
    },
    {
      id: 'cluster_5',
      name: 'Cụm 5: Tâm lý Tiêu dùng, Tiếp thị & Kinh tế Hành vi',
      legal: 'Thương mại & Dịch vụ: Các tập đoàn bán lẻ, sàn TMĐT, Fintech, Marketing Agency.',
      apa: 'APA Div 23 (Consumer Psychology), Div 46 (Media & Tech)',
      desc: 'Nghiên cứu hành vi người tiêu dùng, thiết kế cú hích hành vi (Nudge), tối ưu hóa trải nghiệm khách hàng.',
      match: Math.round(s.d4_data_t * 0.35 + s.d3_emp_t * 0.25 + s.d2_amb_t * 0.25 + s.d1_macro_t * 0.15)
    },
    {
      id: 'cluster_6',
      name: 'Cụm 6: Công thái Nhận thức, Trải nghiệm Người dùng (UX) & Não bộ',
      legal: 'Công nghệ & Đổi mới sáng tạo: Công ty phần mềm, AI Labs, Studio Game.',
      apa: 'APA Div 21 (Applied Experimental & Engineering), Div 3, Div 6, Div 40',
      desc: 'UX Researcher, thiết kế tương tác người - máy tính, ứng dụng khoa học thần kinh và đánh giá an toàn AI.',
      match: Math.round(s.d3_tec_t * 0.4 + s.d4_data_t * 0.3 + s.d4_things_t * 0.2 + s.d2_amb_t * 0.1)
    },
    {
      id: 'cluster_7',
      name: 'Cụm 7: Tâm lý Thể thao, Hiệu suất Đỉnh cao & Nghệ thuật',
      legal: 'Thể thao chuyên nghiệp & Nghệ thuật: Trung tâm HLTT Quốc gia, CLB Esports.',
      apa: 'APA Div 47 (Sport & Exercise Psychology), Div 10 (Aesthetics & Creativity)',
      desc: 'Huấn luyện tâm lý thi đấu đỉnh cao, duy trì trạng thái dòng chảy (Flow), phục hồi tâm lý sau thất bại.',
      match: Math.round(s.d1_micro_t * 0.3 + s.d3_emp_t * 0.3 + (80 - s.d5_pd_t) * 0.2 + s.d2_amb_t * 0.2)
    },
    {
      id: 'cluster_8',
      name: 'Cụm 8: Tâm lý Pháp y, Tội phạm & An ninh Tư pháp',
      legal: 'Tư pháp & Y tế công lập: Viện Pháp y Tâm thần Trung ương, Tòa án, Trại giam.',
      apa: 'APA Div 41 (Psychology and Law), Div 18 (Public Service)',
      desc: 'Giám định tâm thần tư pháp, đánh giá nguy cơ tái phạm, tâm lý học lời khai và bảo vệ nhân chứng.',
      match: Math.round(s.d3_emp_t * 0.35 + (80 - s.d5_pd_t) * 0.25 + s.d1_macro_t * 0.2 + s.d2_amb_t * 0.2)
    },
    {
      id: 'cluster_9',
      name: 'Cụm 9: Nghiên cứu Học thuật, Giảng dạy & Đo lường Tâm trắc',
      legal: 'Giáo dục Đại học & Viện Hàn lâm: Các trường ĐH, Viện nghiên cứu, tổ chức NGO.',
      apa: 'APA Div 2 (Teaching), Div 5 (Quantitative Methods & Psychometrics), Div 27 (Community)',
      desc: 'Giảng dạy đại học, chuẩn hóa thang đo tâm trắc học, nghiên cứu chính sách an sinh xã hội.',
      match: Math.round(s.d4_data_t * 0.35 + s.d3_emp_t * 0.25 + s.d1_macro_t * 0.25 + s.d8_fut_t * 0.15)
    }
  ];

  return clusters.sort((a, b) => b.match - a.match);
}

// Evaluate 9 Configural Rules
export function evaluateConfiguralRules(s: DimensionScores): ConfiguralRuleResult[] {
  return [
    {
      id: 'RULE_01',
      name: 'Sức Bật Sang Chấn (Trauma Resilience)',
      triggered: (s.d5_pt_t > 58 && s.d5_pd_t < 44 && s.d2_amb_t > 52),
      type: 'positive',
      roadmap: 'Tập trung phòng ngừa mệt mỏi thấu cảm (Compassion Fatigue). Thực hành nhật ký tự phản tỉnh sau ca.',
      feedback: 'Hồ sơ của bạn cho thấy khả năng duy trì góc nhìn khách quan và điều hòa cảm xúc tốt trước các câu chuyện mang tính sang chấn (Div 56, 41).'
    },
    {
      id: 'RULE_02',
      name: 'Cứu Rỗi & Nguy Cơ Ranh Giới (Savior / Boundary Risk)',
      triggered: (s.d7_sac_t > 58 && s.d8_fse_t < 46 && s.d3_rel_t > 58),
      type: 'warning',
      roadmap: 'Giám sát dựa trên tâm trí hóa (Mentalization). Phân định nhu cầu thân chủ và nhu cầu "được cần đến" của bản thân.',
      feedback: 'Bạn có lòng trắc ẩn sâu sắc. Thiết lập ranh giới can thiệp rõ ràng sẽ là công cụ bảo vệ bạn bền vững và trao quyền tự chủ cho thân chủ.'
    },
    {
      id: 'RULE_03',
      name: 'Nhà Vận Động Hệ Thống (Systemic Advocate)',
      triggered: (s.d4_people_t > 58 && s.d1_macro_t > 56 && s.d2_amb_t > 50),
      type: 'positive',
      roadmap: 'Rèn luyện khả năng chịu đựng sự trì trệ của hệ thống (Frustration tolerance). Xây dựng liên minh đa ngành.',
      feedback: 'Với tư duy vĩ mô và sự nhạy bén với cấu trúc xã hội, bạn có tiềm năng tạo chuyển biến ở tầm chính sách và cộng đồng (Div 27, 9).'
    },
    {
      id: 'RULE_04',
      name: 'Kiến Trúc Sư Công Thái Nhận Thức (Cognitive / Data Architect)',
      triggered: (Math.max(s.d4_things_t, s.d4_data_t) > 58 && s.d3_emp_t > 56 && s.d5_pt_t <= 55),
      type: 'positive',
      roadmap: 'Phát triển các dự án ứng dụng Tâm trắc học, AI, Yếu tố con người. Giám sát viên đóng vai trò cố vấn chuyên môn.',
      feedback: 'Hồ sơ của bạn nổi bật với tư duy hệ thống và phân tích dữ liệu (Div 21, 14, 5). Bạn là kiến trúc sư kiến tạo các quy trình chuẩn xác.'
    },
    {
      id: 'RULE_05',
      name: 'Ngập Lụt Thấu Cảm & Tê Liệt Thực Tập Sinh (Empathic Flooding)',
      triggered: (s.d5_pd_t > 60 && s.d2_amb_t < 44),
      type: 'critical',
      roadmap: 'Can thiệp hỗ trợ sớm ở IDM Level 1: Giảm tải ca bệnh nặng, áp dụng kỹ thuật xoa dịu cảm xúc (Grounding).',
      feedback: 'Độ nhạy cảm cảm xúc của bạn rất cao. Cần rèn luyện tấm màng lọc cảm xúc để bảo vệ nội lực trước khi bước vào các ca lâm sàng nặng.'
    },
    {
      id: 'RULE_06',
      name: 'Cuồng Tín Đạo Đức vs Quán Tính Thể Chế (Moral Zealot)',
      triggered: (s.d1_macro_t > 60 && s.d2_amb_t < 42),
      type: 'warning',
      roadmap: 'Dạy kỹ năng "chiến lược gia" thay vì "chiến binh". Phát triển tư duy biện chứng (Dialectical thinking).',
      feedback: 'Lý tưởng cải cách xã hội của bạn rất cao. Hãy trang bị sự kiên nhẫn với các tiến trình chuyển đổi chậm chạp của tổ chức.'
    },
    {
      id: 'RULE_07',
      name: 'Kỹ Thuật Viên Lạnh Lùng / Trí Thức Hóa (Cold Intellectualizer)',
      triggered: (s.d3_emp_t > 60 && s.d5_pt_t > 55 && s.d6_rfq_t < 45),
      type: 'warning',
      roadmap: 'Giám sát qua băng hình ca lâm sàng, tập trung vào tiến trình tương tác (Process) "tại đây và lúc này" thay vì lý thuyết thuần túy.',
      feedback: 'Bạn nắm rất vững công cụ kỹ thuật. Hãy bổ sung sự kết nối cảm xúc chân thực để nuôi dưỡng liên minh trị liệu bền chặt.'
    },
    {
      id: 'RULE_08',
      name: 'Cân Bằng Lâm Sàng - Thương Mại (Clinical-Commercial Dilemma)',
      triggered: (s.d3_rel_t > 58 && s.d1_meso_t > 55),
      type: 'positive',
      roadmap: 'Khuyến nghị mô hình "Thực hành Kép (Hybrid Trajectory)": EAP Doanh nghiệp kết hợp phòng tham vấn tư nhân.',
      feedback: 'Khao khát chữa lành nhân văn hoàn toàn có thể song hành cùng sự độc lập tài chính thông qua các dịch vụ EAP và doanh nghiệp.'
    },
    {
      id: 'RULE_09',
      name: 'Hội Chứng Kẻ Giả Mạo & Bất An Giám Sát (Imposter Defense)',
      triggered: (s.d8_fut_t > 58 && s.d8_fse_t < 44 && s.d5_pt_t > 56),
      type: 'warning',
      roadmap: 'Giám sát viên thiết lập môi trường an toàn tâm lý tuyệt đối, phản hồi dựa trên điểm mạnh (Strengths-based Feedback).',
      feedback: 'Sự cầu thị học hỏi của bạn rất đáng quý. Hãy nhớ sự bất an trong những bước đi đầu tiên là trải nghiệm phổ quát của mọi nhà thực hành.'
    }
  ];
}
