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

import { 
  ONET_BENCHMARK_PROFILES, 
  calculateMahalanobisFit, 
  OnetTargetVector 
} from './onet-benchmarks';

// Career Clusters Evaluation via Empirical O*NET Benchmarks & Mahalanobis Distance
export function evaluateCareerClusters(s: DimensionScores): CareerMatch[] {
  const getMatch = (clusterId: string, userVector: OnetTargetVector) => {
    const benchmark = ONET_BENCHMARK_PROFILES.find(b => b.clusterId === clusterId);
    if (!benchmark) {
      return { match: 50, dist: 2.0, soc: 'N/A', title: '' };
    }
    const fit = calculateMahalanobisFit(userVector, benchmark);
    return {
      match: fit.matchPercentage,
      dist: fit.mahalanobisDistance,
      soc: benchmark.socCode,
      title: benchmark.title
    };
  };

  const fit1 = getMatch('cluster_1', {
    d1: s.d1_micro_t, d2: s.d2_amb_t, d3: s.d3_emp_t, d4: s.d4_people_t,
    d5_pt: s.d5_pt_t, d5_pd: s.d5_pd_t, d6: s.d6_rfq_t, d7: s.d7_hea_t, d8: s.d8_fut_t
  });

  const fit2 = getMatch('cluster_2', {
    d1: s.d1_micro_t, d2: s.d2_amb_t, d3: s.d3_rel_t, d4: s.d4_people_t,
    d5_pt: s.d5_pt_t, d5_pd: s.d5_pd_t, d6: s.d6_rfq_t, d7: s.d7_hea_t, d8: s.d8_fut_t
  });

  const fit3 = getMatch('cluster_3', {
    d1: s.d1_meso_t, d2: s.d2_amb_t, d3: s.d3_rel_t, d4: s.d4_people_t,
    d5_pt: s.d5_pt_t, d5_pd: s.d5_pd_t, d6: s.d6_rfq_t, d7: s.d7_hea_t, d8: s.d8_fut_t
  });

  const fit4 = getMatch('cluster_4', {
    d1: s.d1_meso_t, d2: s.d2_amb_t, d3: s.d3_emp_t, d4: s.d4_people_t,
    d5_pt: s.d5_pt_t, d5_pd: s.d5_pd_t, d6: s.d6_rfq_t, d7: s.d7_hea_t, d8: s.d8_fut_t
  });

  const fit5 = getMatch('cluster_5', {
    d1: s.d1_macro_t, d2: s.d2_amb_t, d3: s.d3_emp_t, d4: s.d4_data_t,
    d5_pt: s.d5_pt_t, d5_pd: s.d5_pd_t, d6: s.d6_rfq_t, d7: s.d7_hea_t, d8: s.d8_fut_t
  });

  const fit6 = getMatch('cluster_6', {
    d1: s.d1_meso_t, d2: s.d2_amb_t, d3: s.d3_tec_t, d4: s.d4_data_t,
    d5_pt: s.d5_pt_t, d5_pd: s.d5_pd_t, d6: s.d6_rfq_t, d7: s.d7_hea_t, d8: s.d8_fut_t
  });

  const fit7 = getMatch('cluster_7', {
    d1: s.d1_micro_t, d2: s.d2_amb_t, d3: s.d3_emp_t, d4: s.d4_people_t,
    d5_pt: s.d5_pt_t, d5_pd: s.d5_pd_t, d6: s.d6_rfq_t, d7: s.d7_hea_t, d8: s.d8_fut_t
  });

  const fit8 = getMatch('cluster_8', {
    d1: s.d1_macro_t, d2: s.d2_amb_t, d3: s.d3_emp_t, d4: s.d4_data_t,
    d5_pt: s.d5_pt_t, d5_pd: s.d5_pd_t, d6: s.d6_rfq_t, d7: s.d7_hea_t, d8: s.d8_fut_t
  });

  const fit9 = getMatch('cluster_9', {
    d1: s.d1_macro_t, d2: s.d2_amb_t, d3: s.d3_emp_t, d4: s.d4_data_t,
    d5_pt: s.d5_pt_t, d5_pd: s.d5_pd_t, d6: s.d6_rfq_t, d7: s.d7_hea_t, d8: s.d8_fut_t
  });

  const clusters: CareerMatch[] = [
    {
      id: 'cluster_1',
      name: 'Cụm 1: Tâm lý học Lâm sàng & Sức khỏe Y tế',
      legal: 'Luật Khám bệnh, chữa bệnh 2023 & NĐ 96/2023/NĐ-CP: Yêu cầu tối thiểu 09 tháng thực hành có hướng dẫn tại cơ sở khám chữa bệnh nội trú để đủ điều kiện cấp Giấy phép hành nghề.',
      apa: 'APA Div 12 (Society of Clinical Psychology), Div 40 (Clinical Neuropsychology), Div 56 (Trauma Psychology), Div 38 (Health Psychology)',
      desc: 'Thực hành chẩn đoán tâm lý, lượng giá suy giảm chức năng nhận thức/hành vi, và can thiệp trị liệu tâm lý trong môi trường bệnh viện đa khoa, bệnh viện chuyên khoa tâm thần hoặc trung tâm phục hồi chức năng.',
      formulaExplanation: `Khoảng cách Mahalanobis DM = ${fit1.dist} (Đối chiếu chuẩn O*NET ${fit1.soc}: ${fit1.title})`,
      match: fit1.match,
      coreDrivers: [
        s.d1_micro_t >= 55 ? `Can thiệp vi mô cá nhân (T=${s.d1_micro_t}) đáp ứng yêu cầu phiên làm việc 1-1 chuyên sâu.` : '',
        s.d3_emp_t >= 55 ? `Tư duy thực nghiệm (T=${s.d3_emp_t}) phù hợp với phác đồ can thiệp dựa trên chứng cứ (EBP).` : '',
        s.d5_pd_t < 48 ? `Khả năng kiểm soát ngập lụt cảm xúc tốt (T=${s.d5_pd_t}) giúp duy trì sự bình ổn trước ca bệnh nặng.` : ''
      ].filter(Boolean),
      growthAreas: [
        s.d3_emp_t < 52 ? `Cần củng cố kiến thức đo lường tâm trắc và trắc nghiệm thần kinh (Neuropsychological Testing).` : '',
        s.d5_pd_t >= 52 ? `Cần chú ý rèn luyện kỹ thuật phân ly cảm xúc lành mạnh để giảm thiểu nguy cơ mệt mỏi thấu cảm.` : '',
        'Lộ trình yêu cầu hoàn thành thời gian thực hành bệnh viện theo quy định của Bộ Y tế.'
      ].filter(Boolean)
    },
    {
      id: 'cluster_2',
      name: 'Cụm 2: Tham vấn Tâm lý & Trị liệu Ngoại trú Phi Y tế',
      legal: 'Bộ luật Dân sự & Luật Doanh nghiệp: Hành nghề tự do, thành lập văn phòng tham vấn tư nhân hoặc hợp tác với các trung tâm tâm lý học độc lập.',
      apa: 'APA Div 17 (Society of Counseling Psychology), Div 29 (Society for the Advancement of Psychotherapy), Div 32 (Society for Humanistic Psychology)',
      desc: 'Đồng hành hỗ trợ cá nhân và gia đình tháo gỡ khủng hoảng đời sống, mâu thuẫn mối quan hệ, thích ứng chuyển giai đoạn và khơi mở tiềm năng phát triển nội tâm.',
      formulaExplanation: `Khoảng cách Mahalanobis DM = ${fit2.dist} (Đối chiếu chuẩn O*NET ${fit2.soc}: ${fit2.title})`,
      match: fit2.match,
      coreDrivers: [
        s.d3_rel_t >= 55 ? `Phong cách nhân văn (T=${s.d3_rel_t}) là nền tảng xây dựng liên minh tham vấn an toàn.` : '',
        s.d4_people_t >= 55 ? `Nhu cầu làm việc với con người cao (T=${s.d4_people_t}) tạo nguồn năng lượng dồi dào trong các phiên đối thoại.` : '',
        s.d5_pt_t >= 55 ? `Năng lực đồng cảm nhận thức tốt (T=${s.d5_pt_t}) giúp thấu hiểu trọn vẹn lăng kính của thân chủ.` : ''
      ].filter(Boolean),
      growthAreas: [
        s.d7_sac_t >= 55 ? `Cần lưu ý kiểm soát xu hướng cho đi quên mình và ranh giới chuyên môn ngoài phiên tham vấn.` : '',
        s.d2_amb_t < 50 ? `Rèn luyện sự kiên nhẫn khi thân chủ chưa sẵn sàng thay đổi hoặc diễn tiến trị liệu chậm.` : '',
        'Cần duy trì giám sát chuyên môn định kỳ (Supervision) để soi chiếu chuyển di và phản chuyển di.'
      ].filter(Boolean)
    },
    {
      id: 'cluster_3',
      name: 'Cụm 3: Tâm lý học Học đường & Can thiệp Phát triển',
      legal: 'Thông tư số 20/2023/TT-BGDĐT: Quy định mã số, tiêu chuẩn chức danh nghề nghiệp Viên chức Tư vấn học sinh (Mã số V.07.07.24) trong các cơ sở giáo dục phổ thông.',
      apa: 'APA Div 16 (School Psychology), Div 53 (Clinical Child & Adolescent), Div 7 (Developmental Psychology)',
      desc: 'Đánh giá phát triển trẻ em, can thiệp sớm các rối loạn học tập và phát triển thần kinh (ADHD, Tự kỷ), tư vấn khó khăn tâm lý học đường và phối hợp gia đình - nhà trường.',
      formulaExplanation: `Khoảng cách Mahalanobis DM = ${fit3.dist} (Đối chiếu chuẩn O*NET ${fit3.soc}: ${fit3.title})`,
      match: fit3.match,
      coreDrivers: [
        s.d1_meso_t >= 55 ? `Khả năng tương tác trung mô (T=${s.d1_meso_t}) giúp kết nối hiệu quả giữa học sinh, phụ huynh và giáo viên.` : '',
        s.d4_people_t >= 55 ? `Sự kiên nhẫn với trẻ em và thanh thiếu niên (T=${s.d4_people_t}) tạo điểm tựa tâm lý vững vàng.` : ''
      ].filter(Boolean),
      growthAreas: [
        s.d1_meso_t < 50 ? `Cần nâng cao kỹ năng phối hợp đa bên và giải quyết xung đột trong môi trường sư phạm.` : '',
        'Cần trang bị chứng chỉ can thiệp giáo dục đặc biệt hoặc tâm lý học đường chuyên sâu.'
      ].filter(Boolean)
    },
    {
      id: 'cluster_4',
      name: 'Cụm 4: Tâm lý Tổ chức, Doanh nghiệp & Quản trị Nhân sự (I/O)',
      legal: 'Bộ luật Lao động 2019: Khối doanh nghiệp tư nhân, tập đoàn đa quốc gia, công ty tư vấn quản trị và các chương trình Hỗ trợ Nhân viên (EAP).',
      apa: 'APA Div 14 (Society for Industrial and Organizational Psychology - SIOP), Div 13 (Society of Consulting Psychology)',
      desc: 'Ứng dụng các quy luật tâm lý vào tuyển dụng nhân tài, đánh giá năng lực (Assessment Center), xây dựng văn hóa doanh nghiệp, đào tạo phát triển (L&D) và thiết kế phúc lợi tâm lý.',
      formulaExplanation: `Khoảng cách Mahalanobis DM = ${fit4.dist} (Đối chiếu chuẩn O*NET ${fit4.soc}: ${fit4.title})`,
      match: fit4.match,
      coreDrivers: [
        s.d1_meso_t >= 55 ? `Hiểu biết về văn hóa tổ chức và động lực nhóm (T=${s.d1_meso_t}) là lợi thế lớn trong môi trường doanh nghiệp.` : '',
        s.d8_fut_t >= 55 ? `Tầm nhìn chiến lược dài hạn (T=${s.d8_fut_t}) giúp hoạch định các chính sách phát triển nhân tài bền vững.` : ''
      ].filter(Boolean),
      growthAreas: [
        s.d4_data_t < 50 ? `Cần trau dồi kỹ năng phân tích dữ liệu nhân sự (People Analytics) và đánh giá hiệu quả đầu tư (ROI).` : '',
        'Làm quen với các chỉ số hiệu suất doanh nghiệp (KPI, OKR) bên cạnh các tiêu chí tâm lý thuần túy.'
      ].filter(Boolean)
    },
    {
      id: 'cluster_5',
      name: 'Cụm 5: Tâm lý Tiêu dùng, Tiếp thị & Kinh tế Hành vi',
      legal: 'Luật Thương mại & Luật Bảo vệ Quyền lợi Người tiêu dùng: Các tập đoàn bán lẻ, thương mại điện tử, công ty nghiên cứu thị trường và agency truyền thông.',
      apa: 'APA Div 23 (Society for Consumer Psychology), Div 46 (Society for Media Psychology and Technology)',
      desc: 'Giải mã quá trình ra quyết định của khách hàng, ứng dụng các hiệu ứng thiên kiến nhận thức (Cognitive Biases) và thiết kế cú hích hành vi (Nudge) để tối ưu hóa chiến lược tiếp thị.',
      formulaExplanation: `Khoảng cách Mahalanobis DM = ${fit5.dist} (Đối chiếu chuẩn O*NET ${fit5.soc}: ${fit5.title})`,
      match: fit5.match,
      coreDrivers: [
        s.d4_data_t >= 55 ? `Tư duy dữ liệu (T=${s.d4_data_t}) giúp bóc tách hành vi người dùng qua các bộ chỉ số định lượng.` : '',
        s.d2_amb_t >= 55 ? `Khả năng dung nạp bất định (T=${s.d2_amb_t}) thích ứng tốt với sự biến động nhanh của thị trường.` : ''
      ].filter(Boolean),
      growthAreas: [
        s.d3_tec_t < 50 ? `Cần bổ sung kiến thức về công cụ phân tích dữ liệu số (Google Analytics, SQL, Python căn bản).` : '',
        'Chú ý cân bằng giữa mục tiêu lợi nhuận thương mại và đạo đức bảo vệ người tiêu dùng.'
      ].filter(Boolean)
    },
    {
      id: 'cluster_6',
      name: 'Cụm 6: Công thái Nhận thức, Trải nghiệm Người dùng (UX) & Não bộ',
      legal: 'Luật Công nghệ thông tin & Sở hữu trí tuệ: Các công ty phần mềm, studio trò chơi, trung tâm nghiên cứu AI và các phòng thí nghiệm tương tác Người - Máy (HCI).',
      apa: 'APA Div 21 (Applied Experimental & Engineering Psychology), Div 3 (Experimental Psychology), Div 40 (Clinical Neuropsychology)',
      desc: 'Nghiên cứu mô hình tải nhận thức (Cognitive Load), bản đồ chú ý thị giác và khả năng phản xạ hành vi nhằm thiết kế giao diện số, thiết bị thông minh và đảm bảo an toàn trải nghiệm người dùng.',
      formulaExplanation: `Khoảng cách Mahalanobis DM = ${fit6.dist} (Đối chiếu chuẩn O*NET ${fit6.soc}: ${fit6.title})`,
      match: fit6.match,
      coreDrivers: [
        s.d3_tec_t >= 55 ? `Sự nhạy bén với công nghệ (T=${s.d3_tec_t}) giúp bắc cầu giữa tâm lý học nhận thức và lập trình sản phẩm.` : '',
        s.d4_data_t >= 55 ? `Năng lực xử lý dữ liệu kiểm thử (T=${s.d4_data_t}) tối ưu hóa độ chính xác của các bài A/B Testing.` : ''
      ].filter(Boolean),
      growthAreas: [
        s.d4_things_t < 50 ? `Cần thực hành thêm các phương pháp phỏng vấn người dùng định tính (Usability Testing).` : '',
        'Trau dồi kỹ năng sử dụng công cụ thiết kế nguyên mẫu (Figma, ProtoPie).'
      ].filter(Boolean)
    },
    {
      id: 'cluster_7',
      name: 'Cụm 7: Tâm lý Thể thao, Hiệu suất Đỉnh cao & Nghệ thuật',
      legal: 'Luật Thể dục, Thể thao: Các trung tâm huấn luyện thể thao quốc gia, câu lạc bộ bóng đá chuyên nghiệp, đội tuyển Thể thao điện tử (Esports) và học viện nghệ thuật.',
      apa: 'APA Div 47 (Society for Sport, Exercise & Performance Psychology), Div 10 (Society for the Psychology of Aesthetics, Creativity and the Arts)',
      desc: 'Huấn luyện kỹ năng tâm lý (PST), duy trì sự tập trung dưới áp lực thi đấu, điều hòa lo âu trước trận đấu, phục hồi tâm lý sau chấn thương và duy trì trạng thái dòng chảy (Flow).',
      formulaExplanation: `Khoảng cách Mahalanobis DM = ${fit7.dist} (Đối chiếu chuẩn O*NET ${fit7.soc}: ${fit7.title})`,
      match: fit7.match,
      coreDrivers: [
        s.d5_pd_t < 48 ? `Tâm lý vững vàng không bị lây lan hoảng loạn (T=${s.d5_pd_t}) là phẩm chất then chốt khi đồng hành với vận động viên.` : '',
        s.d3_emp_t >= 55 ? `Áp dụng các kỹ thuật phản hồi sinh học (Biofeedback) và đo lường thời gian phản xạ bài bản.` : ''
      ].filter(Boolean),
      growthAreas: [
        'Cần hiểu biết sâu về đặc thù vận động học thể chất và cơ chế sinh lý gắng sức.',
        'Môi trường thể thao chuyên nghiệp đòi hỏi khả năng di chuyển liên tục theo mùa thi đấu.'
      ].filter(Boolean)
    },
    {
      id: 'cluster_8',
      name: 'Cụm 8: Tâm lý Pháp y, Tội phạm & An ninh Tư pháp',
      legal: 'Luật Giám định tư pháp & Bộ luật Tố tụng Hình sự: Viện Pháp y Tâm thần Trung ương, tòa án, cơ sở giam giữ và các cơ quan bảo vệ pháp luật.',
      apa: 'APA Div 41 (American Psychology-Law Society), Div 18 (Psychologists in Public Service)',
      desc: 'Đánh giá năng lực hành vi và trách nhiệm hình sự, giám định tâm thần tư pháp, phân tích động cơ hành vi tội phạm, hỗ trợ tâm lý nạn nhân và người làm chứng tại tòa.',
      formulaExplanation: `Khoảng cách Mahalanobis DM = ${fit8.dist} (Đối chiếu chuẩn O*NET ${fit8.soc}: ${fit8.title})`,
      match: fit8.match,
      coreDrivers: [
        s.d3_emp_t >= 55 ? `Tư duy logic chứng cứ chặt chẽ (T=${s.d3_emp_t}) đảm bảo tính hợp thức của báo cáo giám định tư pháp.` : '',
        s.d5_pd_t < 48 ? `Khả năng giữ vững sự bình thản trước các tình tiết phạm tội bạo lực hoặc sang chấn nặng nề.` : ''
      ].filter(Boolean),
      growthAreas: [
        'Yêu cầu nắm vững hệ thống văn bản quy phạm pháp luật và tố tụng hình sự Việt Nam.',
        'Đòi hỏi tính liêm chính nghề nghiệp tuyệt đối và quy trình bảo vệ chứng cứ nghiêm ngặt.'
      ].filter(Boolean)
    },
    {
      id: 'cluster_9',
      name: 'Cụm 9: Nghiên cứu Học thuật, Giảng dạy & Đo lường Tâm trắc',
      legal: 'Luật Giáo dục Đại học & Luật Khoa học và Công nghệ: Các trường đại học, viện nghiên cứu chuyên ngành, tổ chức quốc tế và các cơ quan khảo thí.',
      apa: 'APA Div 2 (Society for the Teaching of Psychology), Div 5 (Quantitative and Qualitative Methods / Evaluation, Measurement & Statistics)',
      desc: 'Giảng dạy các bộ môn tâm lý học, thiết kế và thẩm định độ tin cậy/độ hiệu lực của thang đo tâm trắc (Psychometrics), thực hiện các đề tài nghiên cứu cơ bản và ứng dụng.',
      formulaExplanation: `Khoảng cách Mahalanobis DM = ${fit9.dist} (Đối chiếu chuẩn O*NET ${fit9.soc}: ${fit9.title})`,
      match: fit9.match,
      coreDrivers: [
        s.d4_data_t >= 55 ? `Khả năng làm việc với số liệu thống kê (T=${s.d4_data_t}) là công cụ then chốt trong nghiên cứu định lượng.` : '',
        s.d8_fut_t >= 55 ? `Cam kết dài hạn và định hướng học tập suốt đời (T=${s.d8_fut_t}) phù hợp với con đường học thuật.` : ''
      ].filter(Boolean),
      growthAreas: [
        s.d3_emp_t < 52 ? `Cần trau dồi các phương pháp thống kê nâng cao (EFA, CFA, SEM) và kỹ năng viết bài báo khoa học chuẩn APA.` : '',
        'Lộ trình giảng dạy đại học thường yêu cầu học vị tối thiểu từ Thạc sĩ hoặc Tiến sĩ trở lên.'
      ].filter(Boolean)
    }
  ];

  return clusters.sort((a, b) => b.match - a.match);
}

// Evaluate 9 Configural Rules with neutral, non-hyperbolic academic terminology
export function evaluateConfiguralRules(s: DimensionScores): ConfiguralRuleResult[] {
  return [
    {
      id: 'RULE_01',
      name: 'Năng Lực Phân Ly Cảm Xúc Khách Quan Trong Ca Khó',
      triggered: (s.d5_pt_t > 58 && s.d5_pd_t < 44 && s.d2_amb_t > 52),
      type: 'positive',
      roadmap: 'Duy trì thói quen viết nhật ký tự phản tư sau mỗi ca làm việc và tham vấn giám sát định kỳ để phòng ngừa mệt mỏi thấu cảm tích lũy.',
      feedback: 'Hồ sơ phản ánh khả năng đồng cảm nhận thức cao đi kèm sự vững vàng nội tâm, giúp bạn duy trì góc nhìn chuyên môn sáng suốt khi tiếp xúc với các ca bệnh có diễn tiến phức tạp.'
    },
    {
      id: 'RULE_02',
      name: 'Khuynh Hướng Hy Sinh Tự Thân & Nguy Cơ Ranh Giới Chuyên Môn',
      triggered: (s.d7_sac_t > 58 && s.d8_fse_t < 46 && s.d3_rel_t > 58),
      type: 'warning',
      roadmap: 'Tập trung giám sát về ranh giới hành nghề (Boundaries in Counseling), phân định rõ nhu cầu tự thân và mục tiêu trị liệu của thân chủ.',
      feedback: 'Bạn sở hữu sự tận tụy và lòng trắc ẩn sâu sắc. Tuy nhiên, việc nhận thức rõ ranh giới chuyên môn là điều kiện tiên quyết để bảo vệ năng lượng hành nghề lâu dài và tôn trọng quyền tự chủ của người nhận dịch vụ.'
    },
    {
      id: 'RULE_03',
      name: 'Định Hướng Vận Động Chính Sách & Hệ Thống Vĩ Mô',
      triggered: (s.d4_people_t > 58 && s.d1_macro_t > 56 && s.d2_amb_t > 50),
      type: 'positive',
      roadmap: 'Phát triển kỹ năng quản lý dự án cộng đồng, nghiên cứu chính sách an sinh và hợp tác liên ngành giữa tâm lý học, y tế công cộng và công tác xã hội.',
      feedback: 'Bạn có sự nhạy bén đặc biệt với các yếu tố văn hóa, thể chế và cấu trúc xã hội tác động lên sức khỏe tâm thần, phù hợp với các vai trò điều phối chương trình quy mô rộng.'
    },
    {
      id: 'RULE_04',
      name: 'Định Hướng Dữ Liệu & Công Thái Học Nhận Thức',
      triggered: (Math.max(s.d4_things_t, s.d4_data_t) > 58 && s.d3_emp_t > 56 && s.d5_pt_t <= 55),
      type: 'positive',
      roadmap: 'Đầu tư phát triển chuyên môn trong lĩnh vực Tâm trắc học (Psychometrics), Trải nghiệm người dùng (UX Research) hoặc Đánh giá an toàn AI.',
      feedback: 'Hồ sơ nổi bật với tư duy logic, phân tích định lượng và sự chuẩn xác trong quy trình phương pháp luận, là tố chất quan trọng của nhà nghiên cứu thực nghiệm.'
    },
    {
      id: 'RULE_05',
      name: 'Độ Nhạy Cảm Xúc Cao & Nguy Cơ Quá Tải Thấu Cảm',
      triggered: (s.d5_pd_t > 60 && s.d2_amb_t < 44),
      type: 'critical',
      roadmap: 'Ưu tiên làm việc với Giám sát viên về kỹ thuật tiếp đất (Grounding) và điều hòa xúc cảm. Cân đối khối lượng công việc, tránh tiếp nhận dồn dập các ca sang chấn nặng.',
      feedback: 'Bạn có sự nhạy bén cảm xúc rất cao. Cần xây dựng chiến lược tự chăm sóc bản thân (Self-care protocol) để giữ gìn sự cân bằng tâm lý trước khi bước vào các bối cảnh lâm sàng áp lực cao.'
    },
    {
      id: 'RULE_06',
      name: 'Khoảng Cách Giữa Lý Tưởng Cải Cách & Quán Tính Thể Chế',
      triggered: (s.d1_macro_t > 60 && s.d2_amb_t < 42),
      type: 'warning',
      roadmap: 'Rèn luyện tư duy biện chứng và tính kiên nhẫn trước các quy trình hành chính, chia nhỏ các mục tiêu cải tổ thành những bước can thiệp khả thi ngắn hạn.',
      feedback: 'Bạn mang trong mình lý tưởng phụng sự xã hội lớn. Việc trang bị sự thấu hiểu về tiến trình chuyển đổi của các tổ chức sẽ giúp bạn tránh cảm giác bất lực hoặc kiệt sức sớm.'
    },
    {
      id: 'RULE_07',
      name: 'Khuynh Hướng Trí Thức Hóa & Ưu Tiên Quy Trình Kỹ Thuật',
      triggered: (s.d3_emp_t > 60 && s.d5_pt_t > 55 && s.d6_rfq_t < 45),
      type: 'warning',
      roadmap: 'Thực hành quan sát tiến trình tương tác (Process) trong buổi làm việc, chú ý đến các tín hiệu cảm xúc phi ngôn ngữ bên cạnh các triệu chứng mô tả.',
      feedback: 'Bạn nắm rất vững các công cụ lượng giá kỹ thuật. Việc bổ sung sự kết nối cảm xúc tự nhiên sẽ giúp liên minh trị liệu của bạn trở nên gắn kết và ấm áp hơn.'
    },
    {
      id: 'RULE_08',
      name: 'Định Hướng Thực Hành Kép (Lâm Sàng & Doanh Nghiệp)',
      triggered: (s.d3_rel_t > 58 && s.d1_meso_t > 55),
      type: 'positive',
      roadmap: 'Tìm hiểu mô hình dịch vụ Hỗ trợ Nhân viên (EAP) và tham vấn sức khỏe tâm thần tại nơi làm việc, kết hợp linh hoạt giữa chuyên môn tâm lý và kỹ năng quản trị.',
      feedback: 'Hồ sơ cho thấy sự giao thoa hài hòa giữa năng lực thấu hiểu con người và tư duy vận hành nhóm, mở ra tiềm năng hoạt động trong cả môi trường tham vấn tư nhân lẫn khối doanh nghiệp.'
    },
    {
      id: 'RULE_09',
      name: 'Băn Khoăn Năng Lực Tự Thân Giai Đoạn Khởi Nghiệp',
      triggered: (s.d8_fut_t > 58 && s.d8_fse_t < 44 && s.d5_pt_t > 56),
      type: 'warning',
      roadmap: 'Tham gia các nhóm hỗ trợ đồng đẳng (Peer Support Group), tìm kiếm Giám sát viên mang phong cách nuôi dưỡng để nhận các phản hồi dựa trên điểm mạnh.',
      feedback: 'Sự thận trọng và tinh thần cầu thị của bạn rất đáng trân trọng. Hãy nhớ rằng cảm giác bỡ ngỡ trong những năm đầu hành nghề là trải nghiệm phổ biến của hầu hết các nhà thực hành tâm lý.'
    }
  ];
}
