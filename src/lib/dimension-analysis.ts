import { Dimension, DimensionScores } from '@/types';
import { toPercentile } from './scoring';

export interface DimensionSubscaleDetail {
  code: string;
  name: string;
  score: number;
  tScore: number;
  percentile: number;
  interpretation: string;
}

export interface DetailedDimensionReport {
  id: Dimension;
  roman: string;
  name: string;
  domain: string;
  primaryScore: number;
  primaryTScore: number;
  percentile: number;
  tier: 'Điểm cao (Nổi trội)' | 'Cân bằng (Linh hoạt)' | 'Điểm thấp (Thứ cấp)';
  tierBadgeColor: string;
  subscales: DimensionSubscaleDetail[];
  cognitiveStyle: string; // Đặc trưng nhận thức & phong cách tiếp cận
  practicalStrengths: string[]; // Các thế mạnh lâm sàng & thực hành
  blindspotsAndRisks: string[]; // Vùng rủi ro chuyên môn & bẫy mù tâm lý
  supervisionGuidance: string; // Khuyến nghị làm việc với Giám sát viên
  compatibleEnvironments: string[]; // Môi trường thực hành tương thích
}

export function getDetailedDimensionAnalysis(s: DimensionScores): DetailedDimensionReport[] {
  // Helper to determine tier
  const getTier = (t: number) => {
    if (t >= 58) return { label: 'Điểm cao (Nổi trội)' as const, color: 'text-amber-800 bg-amber-100/90 border-amber-300' };
    if (t >= 44) return { label: 'Cân bằng (Linh hoạt)' as const, color: 'text-stone-800 bg-stone-100 border-stone-300' };
    return { label: 'Điểm thấp (Thứ cấp)' as const, color: 'text-stone-600 bg-stone-100 border-stone-200' };
  };

  const reports: DetailedDimensionReport[] = [];

  // ==========================================
  // D1: Không Gian Can Thiệp (Intervention Level)
  // ==========================================
  const d1PrimaryT = Math.max(s.d1_micro_t, s.d1_meso_t, s.d1_macro_t);
  const d1DominantScale = 
    s.d1_micro_t >= s.d1_meso_t && s.d1_micro_t >= s.d1_macro_t ? 'micro' :
    s.d1_meso_t >= s.d1_macro_t ? 'meso' : 'macro';

  const d1Tier = getTier(d1PrimaryT);
  reports.push({
    id: 'D1',
    roman: 'I',
    name: 'Không Gian Can Thiệp',
    domain: 'Quy mô hệ thống & Biên độ tác động',
    primaryScore: s.d1_micro + s.d1_meso + s.d1_macro,
    primaryTScore: d1PrimaryT,
    percentile: toPercentile(d1PrimaryT),
    tier: d1Tier.label,
    tierBadgeColor: d1Tier.color,
    subscales: [
      {
        code: 'MIC',
        name: 'Vi mô (Micro - Thân chủ cá nhân 1-1)',
        score: s.d1_micro,
        tScore: s.d1_micro_t,
        percentile: toPercentile(s.d1_micro_t),
        interpretation: s.d1_micro_t >= 55 
          ? 'Ưu tiên kết nối sâu sắc, tập trung vào thế giới nội tâm cá thể.' 
          : 'Ít thiên về can thiệp cá nhân đơn lẻ kéo dài.'
      },
      {
        code: 'MES',
        name: 'Trung mô (Meso - Gia đình, nhóm & tổ chức)',
        score: s.d1_meso,
        tScore: s.d1_meso_t,
        percentile: toPercentile(s.d1_meso_t),
        interpretation: s.d1_meso_t >= 55 
          ? 'Nhạy bén với động lực nhóm, tương tác gia đình và văn hóa đơn vị.' 
          : 'Xem nhóm như tập hợp cá thể hơn là một chỉnh thể sinh thái.'
      },
      {
        code: 'MAC',
        name: 'Vĩ mô (Macro - Cộng đồng, chính sách & thể chế)',
        score: s.d1_macro,
        tScore: s.d1_macro_t,
        percentile: toPercentile(s.d1_macro_t),
        interpretation: s.d1_macro_t >= 55 
          ? 'Hướng tầm nhìn tới bất bình đẳng cấu trúc, chính sách sức khỏe tâm thần.' 
          : 'Hạn chế tập trung vào các can thiệp quy mô xã hội rộng.'
      }
    ],
    cognitiveStyle: d1DominantScale === 'micro'
      ? 'Bạn tiếp cận vấn đề tâm lý từ chiều sâu vi mô, tin tưởng rằng sự chuyển hóa bền vững nhất bắt nguồn từ liên minh cá thể độc nhất. Bạn nhẫn nại quan sát các chuyển động cảm xúc tinh vi trong phòng tham vấn.'
      : d1DominantScale === 'meso'
      ? 'Bạn có tư duy hệ thống trung mô, nhìn nhận hành vi cá nhân trong mối tương tác chằng chịt với cấu trúc gia đình và văn hóa tổ chức. Bạn thường tìm kiếm đòn bẩy thay đổi từ động lực tập thể.'
      : 'Bạn mang lăng kính vĩ mô, quan tâm đến các yếu tố xã hội, văn hóa, và chính sách tác động lên sức khỏe tâm thần. Bạn không thỏa mãn với việc chỉ chữa lành từng cá nhân khi cấu trúc xung quanh chưa đổi thay.',
    practicalStrengths: [
      d1DominantScale === 'micro' 
        ? 'Thiết lập mối quan hệ đồng minh trị liệu 1-1 có tính bảo mật và tin cậy cao' 
        : d1DominantScale === 'meso' 
        ? 'Điều phối động lực nhóm, xử lý xung đột gia đình và thiết kế chương trình EAP' 
        : 'Vận động chính sách, giáo dục tâm lý cộng đồng và thiết kế can thiệp diện rộng',
      'Định vị rõ ràng biên độ hành nghề, tránh ôm đồm các can thiệp không đúng sở trường',
      'Khả năng điều chỉnh công cụ đánh giá phù hợp với quy mô đối tượng can thiệp'
    ],
    blindspotsAndRisks: [
      d1DominantScale === 'micro'
        ? 'Nguy cơ cảm thấy bất lực hoặc kiệt sức khi vấn đề của thân chủ bắt nguồn từ bế tắc kinh tế - thể chế ngoài tầm kiểm soát của phòng khám.'
        : d1DominantScale === 'meso'
        ? 'Dễ bị cuốn vào các phe phái quyền lực trong tổ chức hoặc xung đột liên thế hệ trong gia đình thân chủ.'
        : 'Nguy cơ "trừu tượng hóa" nỗi đau con người thành số liệu, giảm tính nhạy cảm với trải nghiệm đau khổ cụ thể của từng cá thể.'
    ],
    supervisionGuidance: 'Thảo luận với người giám sát về Mô hình Sinh thái (Bronfenbrenner) để cân bằng giữa can thiệp cá nhân và nhận thức bối cảnh hệ thống, không rơi vào cái bẫy quy kết mọi căn nguyên cho nội tâm cá nhân.',
    compatibleEnvironments: [
      d1DominantScale === 'micro' ? 'Phòng khám tâm lý tư nhân, bệnh viện tâm thần nội trú' :
      d1DominantScale === 'meso' ? 'Bộ phận nhân sự doanh nghiệp (HR/L&D), trường học, trung tâm tham vấn gia đình' :
      'Các tổ chức phi chính phủ (NGO), viện nghiên cứu chính sách, các dự án sức khỏe cộng đồng'
    ]
  });

  // ==========================================
  // D2: Dung Nạp Tính Mơ Hồ (Ambiguity Tolerance)
  // ==========================================
  const d2T = s.d2_amb_t;
  const d2Tier = getTier(d2T);
  reports.push({
    id: 'D2',
    roman: 'II',
    name: 'Dung Nạp Tính Mơ Hồ',
    domain: 'Khả năng vận hành trong bất định & đa nghĩa',
    primaryScore: s.d2_ambiguity,
    primaryTScore: d2T,
    percentile: toPercentile(d2T),
    tier: d2Tier.label,
    tierBadgeColor: d2Tier.color,
    subscales: [
      {
        code: 'AMB',
        name: 'Chỉ số Dung nạp Mơ hồ Lâm sàng',
        score: s.d2_ambiguity,
        tScore: d2T,
        percentile: toPercentile(d2T),
        interpretation: d2T >= 58
          ? 'Dung nạp cao trước những ca bệnh đa chẩn đoán, diễn tiến phức tạp.'
          : d2T >= 44
          ? 'Cân bằng giữa việc tuân thủ quy trình và khả năng ứng biến lâm sàng.'
          : 'Ưu tiên các quy trình chuẩn mực, tiêu chuẩn chẩn đoán tường minh và rõ ràng.'
      }
    ],
    cognitiveStyle: d2T >= 58
      ? 'Bạn có năng lực tiêu cực (Negative Capability) tốt — khả năng tồn tại trong trạng thái không chắc chắn và nghi ngờ mà không vội vã bám víu vào kết luận chẩn đoán sớm. Bạn tôn trọng sự phức tạp của tâm lý người.'
      : d2T >= 44
      ? 'Bạn duy trì sự cân bằng thực tế: vừa có thể ứng biến linh hoạt khi tình huống ca bệnh thay đổi, vừa biết sử dụng các công cụ cấu trúc để định hình hướng đi.'
      : 'Bạn có nhu cầu đóng nhận thức (Need for Cognitive Closure) tương đối cao. Bạn làm việc hiệu quả nhất khi có trong tay phác đồ hướng dẫn chi tiết, tiêu chí phân loại rõ ràng và ranh giới nhiệm vụ cụ thể.',
    practicalStrengths: [
      d2T >= 58
        ? 'Xử lý tốt các ca lâm sàng có triệu chứng chồng chéo (Comorbidity) hoặc khủng hoảng danh tính'
        : 'Thực thi nhất quán các bài test chuẩn hóa, phác đồ can thiệp dựa trên chứng cứ (CBT/DBT)',
      'Không bị dao động mạnh khi thân chủ bộc lộ những tình tiết bất ngờ trong quá trình trị liệu',
      'Khả năng chấp nhận tiến trình hồi phục không theo đường thẳng của thân chủ'
    ],
    blindspotsAndRisks: [
      d2T >= 58
        ? 'Nguy cơ dây dưa kéo dài giai đoạn đánh giá mà không chốt được mục tiêu can thiệp cụ thể (Analysis Paralysis).'
        : 'Dễ nảy sinh lo âu hoặc cứng nhắc khi gặp những ca bệnh không khớp với bất kỳ chẩn đoán trong cẩm nang DSM-5/ICD-11.'
    ],
    supervisionGuidance: d2T >= 58
      ? 'Giám sát viên cần hỗ trợ bạn đặt ra các mốc mục tiêu can thiệp định lượng, tránh để buổi làm việc trôi dạt vô định.'
      : 'Thực hành "ngồi lại với sự bất định" trong giám sát, chấp nhận rằng tâm trí con người không bao giờ vừa vặn 100% trong khung lý thuyết.',
    compatibleEnvironments: [
      d2T >= 58 ? 'Trị liệu tâm động học, trung tâm can thiệp sang chấn, nghiên cứu định tính' :
      'Đánh giá tâm trắc học chuẩn hóa, can thiệp nhận thức hành vi (CBT), quản lý ca (Case Management)'
    ]
  });

  // ==========================================
  // D3: Phong Cách Thực Hành (Practice Orientation)
  // ==========================================
  const d3PrimaryT = Math.max(s.d3_emp_t, s.d3_rel_t, s.d3_tec_t);
  const d3Tier = getTier(d3PrimaryT);
  const d3Dominant = 
    s.d3_emp_t >= s.d3_rel_t && s.d3_emp_t >= s.d3_tec_t ? 'emp' :
    s.d3_rel_t >= s.d3_tec_t ? 'rel' : 'tec';

  reports.push({
    id: 'D3',
    roman: 'III',
    name: 'Phong Cách Thực Hành',
    domain: 'Phương pháp luận & Trục can thiệp cốt lõi',
    primaryScore: s.d3_emp + s.d3_rel + s.d3_tec,
    primaryTScore: d3PrimaryT,
    percentile: toPercentile(d3PrimaryT),
    tier: d3Tier.label,
    tierBadgeColor: d3Tier.color,
    subscales: [
      {
        code: 'EMP',
        name: 'Thực nghiệm & Bằng chứng (Empirical / Science)',
        score: s.d3_emp,
        tScore: s.d3_emp_t,
        percentile: toPercentile(s.d3_emp_t),
        interpretation: s.d3_emp_t >= 55 ? 'Đề cao số liệu, thang đo khách quan và nghiên cứu khoa học.' : 'Ít phụ thuộc vào số liệu định lượng.'
      },
      {
        code: 'REL',
        name: 'Mối quan hệ & Nhân văn (Relational / Humanistic)',
        score: s.d3_rel,
        tScore: s.d3_rel_t,
        percentile: toPercentile(s.d3_rel_t),
        interpretation: s.d3_rel_t >= 55 ? 'Coi trọng liên minh trị liệu, sự hiện diện và trải nghiệm cảm xúc.' : 'Thiên về kỹ thuật hơn là tiến trình quan hệ.'
      },
      {
        code: 'TEC',
        name: 'Công nghệ & Kỹ thuật số (Technological / Tools)',
        score: s.d3_tec,
        tScore: s.d3_tec_t,
        percentile: toPercentile(s.d3_tec_t),
        interpretation: s.d3_tec_t >= 55 ? 'Đam mê ứng dụng phần mềm, AI, VR, Biofeedback vào hỗ trợ tâm lý.' : 'Ưu tiên phương pháp tương tác truyền thống.'
      }
    ],
    cognitiveStyle: d3Dominant === 'emp'
      ? 'Bạn là nhà thực hành mang tư duy khoa học thực chứng (Scientist-Practitioner). Bạn cần nhìn thấy bằng chứng thực nghiệm rõ ràng trước khi áp dụng bất kỳ kỹ thuật nào lên thân chủ.'
      : d3Dominant === 'rel'
      ? 'Bạn mang trái tim của trường phái nhân văn hiện sinh. Bạn tin rằng kỹ thuật chỉ là phụ trợ, còn chính sự chân thực và an toàn trong mối quan hệ trị liệu mới là tác nhân chữa lành cốt lõi.'
      : 'Bạn là người tiên phong về công nghệ ứng dụng. Bạn hào hứng tìm kiếm các công cụ kỹ thuật số mới (VR, ứng dụng di động, thuật toán theo dõi tâm trạng) để tối ưu hóa hiệu quả can thiệp.',
    practicalStrengths: [
      d3Dominant === 'emp'
        ? 'Thiết kế ca can thiệp chặt chẽ, đo lường được tiến triển bằng các thang đo tiền/hậu'
        : d3Dominant === 'rel'
        ? 'Khả năng lắng nghe thấu cảm sâu sắc, duy trì sự chấp nhận vô điều kiện với thân chủ'
        : 'Làm chủ các công cụ hỗ trợ công nghệ cao, tự động hóa quy trình theo dõi triệu chứng',
      'Ý thức nghề nghiệp cao trong việc lựa chọn công cụ can thiệp có nguồn gốc xuất xứ',
      'Dễ dàng hòa nhập vào các nhóm làm việc liên ngành có cùng định hướng chuyên môn'
    ],
    blindspotsAndRisks: [
      d3Dominant === 'emp'
        ? 'Nguy cơ "trí thức hóa" (intellectualization), quá bám vào số liệu mà bỏ quên cảm xúc sống động đang diễn ra giữa hai con người.'
        : d3Dominant === 'rel'
        ? 'Dễ phản đối các bài test chuẩn hóa, thiếu công cụ khách quan để chứng minh hiệu quả can thiệp trước bảo hiểm hoặc pháp lý.'
        : 'Nguy cơ lạm dụng công cụ công nghệ làm mỏng đi sự kết nối cảm xúc thực sự giữa người với người.'
    ],
    supervisionGuidance: 'Thực hành theo Mô hình Thực hành Dựa trên Bằng chứng của APA (EBP): tích hợp cả ba yếu tố: Bằng chứng nghiên cứu tốt nhất + Chuyên môn lâm sàng + Đặc điểm/giá trị riêng của thân chủ.',
    compatibleEnvironments: [
      d3Dominant === 'emp' ? 'Trung tâm nghiên cứu lâm sàng, bệnh viện chuyên khoa, viện hàn lâm' :
      d3Dominant === 'rel' ? 'Văn phòng tham vấn tâm lý độc lập, trị liệu cặp đôi & gia đình' :
      'Các công ty công nghệ y tế (HealthTech), thiết kế trải nghiệm người dùng (UX), EdTech'
    ]
  });

  // ==========================================
  // D4: Định Hướng Đối Tượng (Target Orientation)
  // ==========================================
  const d4PrimaryT = Math.max(s.d4_people_t, s.d4_things_t, s.d4_data_t);
  const d4Tier = getTier(d4PrimaryT);
  const d4Dominant = 
    s.d4_people_t >= s.d4_data_t && s.d4_people_t >= s.d4_things_t ? 'people' :
    s.d4_data_t >= s.d4_things_t ? 'data' : 'things';

  reports.push({
    id: 'D4',
    roman: 'IV',
    name: 'Định Hướng Đối Tượng Tác Nghiệp',
    domain: 'Sở thích môi trường & Vật liệu tác nghiệp',
    primaryScore: s.d4_people + s.d4_things + s.d4_data,
    primaryTScore: d4PrimaryT,
    percentile: toPercentile(d4PrimaryT),
    tier: d4Tier.label,
    tierBadgeColor: d4Tier.color,
    subscales: [
      {
        code: 'PEO',
        name: 'Con người (People - Giao tiếp, thấu cảm, tương tác)',
        score: s.d4_people,
        tScore: s.d4_people_t,
        percentile: toPercentile(s.d4_people_t),
        interpretation: s.d4_people_t >= 55 ? 'Nạp năng lượng qua giao tiếp trực tiếp với con người.' : 'Dễ kiệt sức nếu phải tiếp xúc xã hội liên tục.'
      },
      {
        code: 'THI',
        name: 'Công cụ & Vật thể (Things - Máy móc, thiết bị, phần cứng)',
        score: s.d4_things,
        tScore: s.d4_things_t,
        percentile: toPercentile(s.d4_things_t),
        interpretation: s.d4_things_t >= 55 ? 'Thích thao tác với công cụ vật lý, phần cứng, thiết bị đo.' : 'Ít hứng thú với khía cạnh cơ học, vật lý.'
      },
      {
        code: 'DAT',
        name: 'Dữ liệu & Cấu trúc (Data - Số liệu, mô hình, lý thuyết)',
        score: s.d4_data,
        tScore: s.d4_data_t,
        percentile: toPercentile(s.d4_data_t),
        interpretation: s.d4_data_t >= 55 ? 'Tìm thấy sự hứng khởi trong phân tích số liệu và logic cấu trúc.' : 'Ít ưu tiên xử lý dữ liệu phức tạp.'
      }
    ],
    cognitiveStyle: d4Dominant === 'people'
      ? 'Năng lượng làm việc của bạn tập trung ở con người. Bạn hứng thú với các sắc thái biểu cảm, câu chuyện đời sống và mối tương tác trực diện hơn là các báo cáo tĩnh.'
      : d4Dominant === 'data'
      ? 'Bạn tìm thấy sự an tâm và sáng tỏ trong cấu trúc logic, bảng tính và mô hình thống kê. Dữ liệu là chiếc la bàn đáng tin cậy nhất đối với bạn.'
      : 'Bạn thích tương tác với các công cụ hữu hình, máy đo sinh lý hoặc các ứng dụng thực tế có thể cầm nắm, tinh chỉnh cụ thể.',
    practicalStrengths: [
      d4Dominant === 'people'
        ? 'Khả năng duy trì sự hiện diện ấm áp và lắng nghe tích cực trong các phiên làm việc dài'
        : d4Dominant === 'data'
        ? 'Phân tích dữ liệu trắc lượng, chuẩn hóa công cụ đo lường và thẩm định nghiên cứu'
        : 'Vận hành thành thạo thiết bị đo lường tâm sinh lý (EEG, EMG, Eye-tracker)',
      'Biết cách tìm kiếm nguồn năng lượng bù đắp khi công việc rơi vào trạng thái đơn điệu'
    ],
    blindspotsAndRisks: [
      d4Dominant === 'people'
        ? 'Nguy cơ quá tải tương tác xã hội (Social Exhaustion), khó duy trì khoảng cách cảm xúc khi tiếp xúc với nhiều ca khó liên tiếp.'
        : 'Nguy cơ xa rời thực tế sinh động của con người, xem thân chủ như một tập hợp số liệu hoặc ca bệnh trong hồ sơ.'
    ],
    supervisionGuidance: 'Điều phối thời gian biểu làm việc hợp lý: nếu thiên về Con người, cần có các khoảng đệm hành chính để phục hồi; nếu thiên về Dữ liệu, cần giám sát viên thúc đẩy kỹ năng phản xạ tương tác trực tiếp.',
    compatibleEnvironments: [
      d4Dominant === 'people' ? 'Tham vấn tâm lý, công tác xã hội, chăm sóc giảm nhẹ' :
      d4Dominant === 'data' ? 'Nghiên cứu thị trường, phân tích dữ liệu nhân sự (People Analytics), đo lường tâm trắc' :
      'Phòng thí nghiệm tâm lý thần kinh, công thái học nhận thức (Human Factors)'
    ]
  });

  // ==========================================
  // D5: Cân Bằng Thấu Cảm & Ranh Giới (Empathy Balance)
  // ==========================================
  const d5T = s.d5_pt_t;
  const d5Tier = getTier(d5T);
  const boundaryRatio = (s.d5_pt_t / (s.d5_pd_t || 1)).toFixed(2);

  reports.push({
    id: 'D5',
    roman: 'V',
    name: 'Cân Bằng Thấu Cảm & Ranh Giới',
    domain: 'Tự chủ cảm xúc & Bảo vệ năng lượng nội tâm',
    primaryScore: s.d5_pt + s.d5_pd,
    primaryTScore: d5T,
    percentile: toPercentile(d5T),
    tier: d5Tier.label,
    tierBadgeColor: d5Tier.color,
    subscales: [
      {
        code: 'PT',
        name: 'Đồng cảm nhận thức (Perspective Taking - Đặt mình vào vị trí người khác)',
        score: s.d5_pt,
        tScore: s.d5_pt_t,
        percentile: toPercentile(s.d5_pt_t),
        interpretation: s.d5_pt_t >= 55 ? 'Khả năng hiểu góc nhìn của thân chủ mà không đánh mất góc nhìn bản thân.' : 'Cần rèn luyện thêm khả năng nhìn từ lăng kính người khác.'
      },
      {
        code: 'PD',
        name: 'Ngập lụt cảm xúc (Personal Distress - Đau khổ lây lan khi thấy người khác khổ)',
        score: s.d5_pd,
        tScore: s.d5_pd_t,
        percentile: toPercentile(s.d5_pd_t),
        interpretation: s.d5_pd_t >= 55 ? 'Độ nhạy cảm xúc rất cao, dễ bị "nhiễm" trạng thái u uất/hoảng loạn của thân chủ.' : 'Giữ được sự bình ổn cảm xúc, không bị lây lan trạng thái tiêu cực.'
      }
    ],
    cognitiveStyle: s.d5_pt_t >= 55 && s.d5_pd_t < 48
      ? 'Bạn sở hữu cơ chế thấu cảm lý tưởng cho nhà thực hành: Đồng cảm nhận thức cao đi kèm khả năng phân ly lành mạnh khỏi nỗi đau lây lan. Bạn đồng hành cùng người khác bằng sự sáng suốt thay vì để mình chìm đắm trong nỗi buồn cùng họ.'
      : s.d5_pd_t >= 55
      ? 'Trái tim của bạn vô cùng nhạy cảm. Bạn cảm nhận nỗi đau của người khác như thể nỗi đau của chính mình. Sự trắc ẩn này là một món quà lớn, nhưng cũng là điểm dễ tổn thương nhất của bạn trong môi trường trị liệu.'
      : 'Bạn duy trì khoảng cách cảm xúc an toàn và điềm tĩnh. Bạn ít khi bị cuốn vào cơn bão cảm xúc của người đối diện, tiếp cận ca làm việc bằng sự bình thản.',
    practicalStrengths: [
      'Khả năng nhận diện chính xác trạng thái tâm lý của thân chủ qua ngôn ngữ cơ thể và ngữ điệu',
      s.d5_pd_t < 50 
        ? 'Làm việc bền bỉ với các ca sang chấn phức tạp, tang chế hoặc khủng hoảng tự sát mà không bị suy sụp' 
        : 'Tạo ra bầu không khí ấm áp, chân thành khiến thân chủ cảm thấy được sẻ chia tuyệt đối',
      'Ý thức rõ ràng về tầm quan trọng của việc tự chăm sóc (Self-care)'
    ],
    blindspotsAndRisks: [
      s.d5_pd_t >= 55
        ? 'Nguy cơ cao mắc Hội chứng mệt mỏi thấu cảm (Compassion Fatigue) hoặc Sang chấn gián tiếp (Vicarious Traumatization).'
        : 'Nguy cơ bị thân chủ cảm nhận là thiếu nhiệt tình hoặc quá lý trí nếu khoảng cách cảm xúc quá xa.'
    ],
    supervisionGuidance: 'Thực hành các kỹ thuật tiếp đất (Grounding) và xả cảm xúc sau phiên làm việc. Với người có chỉ số PD cao, cần tuyệt đối tránh việc nhận liên tiếp nhiều ca sang chấn nặng trong giai đoạn thực tập đầu đời.',
    compatibleEnvironments: [
      s.d5_pd_t < 50 ? 'Can thiệp khủng hoảng, phòng cấp cứu tâm thần, trị liệu sang chấn' :
      'Tham vấn hướng nghiệp, phát triển tiềm năng, tâm lý giáo dục, hỗ trợ học tập'
    ]
  });

  // ==========================================
  // D6: Năng Lực Tâm Thần Hóa (Reflective Functioning)
  // ==========================================
  const d6T = s.d6_rfq_t;
  const d6Tier = getTier(d6T);
  reports.push({
    id: 'D6',
    roman: 'VI',
    name: 'Năng Lực Tâm Thần Hóa',
    domain: 'Đọc vị tâm trí & Phản tư động cơ nội tâm',
    primaryScore: s.d6_mentalizing,
    primaryTScore: d6T,
    percentile: toPercentile(d6T),
    tier: d6Tier.label,
    tierBadgeColor: d6Tier.color,
    subscales: [
      {
        code: 'RFQ',
        name: 'Chỉ số Tâm thần hóa (Mentalizing / RFQ)',
        score: s.d6_mentalizing,
        tScore: d6T,
        percentile: toPercentile(d6T),
        interpretation: d6T >= 58
          ? 'Nhận thức sâu sắc rằng tâm trí luôn biến động và không thể quy chụp dễ dàng.'
          : d6T >= 44
          ? 'Năng lực phản tư đạt mức trung bình vững vàng của nhà thực hành.'
          : 'Có xu hướng nhìn nhận hành vi theo bề mặt, ít đào sâu động cơ ẩn giấu.'
      }
    ],
    cognitiveStyle: d6T >= 58
      ? 'Bạn có thái độ khiêm nhường nhận thức (Epistemic Trust & Humility). Bạn hiểu rằng hành vi của con người luôn được dẫn dắt bởi những niềm tin, khát khao và nỗi sợ tiềm ẩn bên dưới, và tâm trí tha nhân là một thế giới mờ đục cần được khám phá cẩn trọng.'
      : 'Bạn tiếp cận hành vi con người theo hướng trực diện và thực tế. Bạn quan tâm nhiều hơn đến những gì đang diễn ra cụ thể trước mắt hơn là suy đoán các tầng động cơ phức tạp.',
    practicalStrengths: [
      'Không vội vã đưa ra nhận xét quy chụp hoặc phán xét đạo đức với hành vi của thân chủ',
      'Khả năng giúp thân chủ tự nhìn lại và giải mã thế giới cảm xúc của chính họ (Reflective Stance)',
      'Nhạy bén với các phản ứng kháng cự ngầm và cơ chế phòng vệ của thân chủ'
    ],
    blindspotsAndRisks: [
      d6T >= 65
        ? 'Nguy cơ suy diễn quá mức (Hypermentalizing) — gán ghép quá nhiều tầng ý nghĩa ẩn dụ cho những hành vi vốn rất giản đơn.'
        : 'Dễ bỏ qua các tín hiệu chuyển di (Transference) hoặc hiểu lầm động cơ thực sự của thân chủ.'
    ],
    supervisionGuidance: 'Thực hành phản tư ca thông qua việc xem lại băng ghi hình hoặc biên bản phiên làm việc. Tự hỏi: "Tại sao thân chủ lại nói câu đó vào đúng thời điểm đó, và mình đã cảm thấy gì khi nghe câu đó?"',
    compatibleEnvironments: [
      'Trị liệu tâm động học (Psychodynamic), Trị liệu dựa trên tâm thần hóa (MBT), tham vấn hôn nhân gia đình, huấn luyện lãnh đạo'
    ]
  });

  // ==========================================
  // D7: Động Cơ Vị Tha & Giới Hạn (Altruism Motivation)
  // ==========================================
  const d7PrimaryT = Math.max(s.d7_hea_t, s.d7_sac_t);
  const d7Tier = getTier(d7PrimaryT);
  reports.push({
    id: 'D7',
    roman: 'VII',
    name: 'Động Cơ Vị Tha & Giới Hạn',
    domain: 'Căn nguyên dấn thân & Động lực cống hiến',
    primaryScore: s.d7_healthy + s.d7_sacrifice,
    primaryTScore: d7PrimaryT,
    percentile: toPercentile(d7PrimaryT),
    tier: d7Tier.label,
    tierBadgeColor: d7Tier.color,
    subscales: [
      {
        code: 'HEA',
        name: 'Vị tha lành mạnh (Healthy Altruism)',
        score: s.d7_healthy,
        tScore: s.d7_hea_t,
        percentile: toPercentile(s.d7_hea_t),
        interpretation: s.d7_hea_t >= 55 ? 'Cống hiến vì niềm tin nhân văn, tôn trọng quyền tự chủ của người khác.' : 'Động cơ cống hiến ở mức độ thực tế, vừa phải.'
      },
      {
        code: 'SAC',
        name: 'Hy sinh tự thân (Pathological Altruism / Self-Sacrifice)',
        score: s.d7_sacrifice,
        tScore: s.d7_sac_t,
        percentile: toPercentile(s.d7_sac_t),
        interpretation: s.d7_sac_t >= 55 ? 'Có xu hướng quên mình, nhận trách nhiệm thay cho người khác quá mức.' : 'Biết thiết lập ranh giới bảo vệ nhu cầu cá nhân.'
      }
    ],
    cognitiveStyle: s.d7_sac_t >= 58
      ? 'Bạn có trái tim cống hiến mãnh liệt nhưng đang tiềm ẩn Phức cảm Người Cứu Rỗi (Savior Complex). Bạn có xu hướng cảm thấy mình phải có trách nhiệm cứu vớt cuộc đời thân chủ, ngay cả khi điều đó vắt kiệt sức khỏe và tài chính của bản thân.'
      : 'Động lực giúp đỡ của bạn xuất phát từ sự tôn trọng lành mạnh và mong muốn nâng đỡ cộng đồng. Bạn hiểu rằng chỉ khi chiếc cốc của mình đầy, mình mới có thể rót nước cho người khác một cách bền vững.',
    practicalStrengths: [
      'Lòng nhiệt huyết, sự tận tâm và cam kết cao độ với tiến trình hồi phục của thân chủ',
      s.d7_sac_t < 50
        ? 'Duy trì được ranh giới tài chính và thời gian rõ ràng, hạn chế tình trạng bị lợi dụng chuyên môn'
        : 'Sẵn lòng đồng hành qua những giai đoạn khó khăn nhất cùng người bệnh',
      'Được đồng nghiệp và thân chủ tin cậy nhờ sự chân thành'
    ],
    blindspotsAndRisks: [
      s.d7_sac_t >= 55
        ? 'Nguy cơ vi phạm ranh giới đạo đức hành nghề (nhắn tin ngoài giờ, cho mượn tiền, làm việc miễn phí quá đà), tước đoạt cơ hội tự chịu trách nhiệm của thân chủ.'
        : 'Nếu điểm vị tha quá thấp, có thể bị cảm nhận là nhà thực hành lạnh lùng, chỉ làm việc vì nghĩa vụ công việc.'
    ],
    supervisionGuidance: 'Giám sát viên cần giúp bạn phân định ranh giới giữa "Chăm sóc thân chủ" và "Nhu cầu cảm thấy bản thân có giá trị qua việc giúp người khác". Học cách nói lời từ chối chuyên môn một cách nhẹ nhàng nhưng kiên quyết.',
    compatibleEnvironments: [
      'Công tác xã hội, các quỹ cứu trợ thiện nguyện, trung tâm bảo trợ nạn nhân bạo lực, tư vấn hướng nghiệp'
    ]
  });

  // ==========================================
  // D8: Dự Phóng Nghề Nghiệp (Professional Projection)
  // ==========================================
  const d8PrimaryT = s.d8_fut_t;
  const d8Tier = getTier(d8PrimaryT);
  reports.push({
    id: 'D8',
    roman: 'VIII',
    name: 'Dự Phóng Nghề Nghiệp & Tự Hiệu Năng',
    domain: 'Tầm nhìn dài hạn & Sức bền nội tâm',
    primaryScore: s.d8_utility + s.d8_efficacy + s.d8_defense,
    primaryTScore: d8PrimaryT,
    percentile: toPercentile(d8PrimaryT),
    tier: d8Tier.label,
    tierBadgeColor: d8Tier.color,
    subscales: [
      {
        code: 'FUT',
        name: 'Định hướng tương lai (Future Utility - Giá trị nghề nghiệp dài hạn)',
        score: s.d8_utility,
        tScore: s.d8_fut_t,
        percentile: toPercentile(s.d8_fut_t),
        interpretation: s.d8_fut_t >= 55 ? 'Cam kết lâu dài với ngành tâm lý, có tầm nhìn 5-10 năm rõ ràng.' : 'Đang trong giai đoạn thăm dò hoặc cân nhắc các ngã rẽ khác.'
      },
      {
        code: 'FSE',
        name: 'Tự hiệu năng nghề nghiệp (Self-Efficacy - Niềm tin vào năng lực bản thân)',
        score: s.d8_efficacy,
        tScore: s.d8_fse_t,
        percentile: toPercentile(s.d8_fse_t),
        interpretation: s.d8_fse_t >= 55 ? 'Tự tin vào khả năng vượt qua thử thách học thuật và lâm sàng.' : 'Còn nhiều hoài nghi về năng lực bản thân, dễ bị dao động.'
      },
      {
        code: 'FDE',
        name: 'Phòng vệ nghề nghiệp (Professional Defense)',
        score: s.d8_defense,
        tScore: s.d8_fde_t,
        percentile: toPercentile(s.d8_fde_t),
        interpretation: s.d8_fde_t >= 55 ? 'Có cơ chế phòng vệ tâm lý trước các định kiến xã hội về ngành.' : 'Dễ bị ảnh hưởng bởi áp lực kinh tế hoặc định kiến gia đình.'
      }
    ],
    cognitiveStyle: s.d8_fut_t >= 55 && s.d8_fse_t >= 52
      ? 'Bạn có tầm nhìn chiến lược và niềm tin vững chắc vào giá trị xã hội của ngành tâm lý. Bạn hiểu rõ những thử thách về chứng chỉ hành nghề và thời gian đào tạo kéo dài, nhưng sẵn sàng đầu tư công sức dài hạn.'
      : s.d8_fse_t < 46
      ? 'Bạn có niềm đam mê lớn với ngành nhưng đang trải qua Hội chứng Kẻ Giả Mạo (Imposter Phenomenon). Bạn thường đánh giá thấp năng lực của mình và lo sợ rằng mình chưa đủ giỏi để giúp đỡ người khác.'
      : 'Bạn tiếp cận lộ trình nghề nghiệp một cách cởi mở và linh hoạt, sẵn sàng thích ứng với các cơ hội việc làm thực tế tại thị trường Việt Nam.',
    practicalStrengths: [
      'Ý chí tự học và tinh thần cầu thị học hỏi suốt đời (Lifelong Learning)',
      'Khả năng lập kế hoạch tích lũy giờ thực hành có giám sát (Supervised Hours) bài bản',
      'Định vị rõ ràng mục tiêu xin học bổng sau đại học hoặc mở rộng mạng lưới chuyên môn'
    ],
    blindspotsAndRisks: [
      s.d8_fse_t < 46
        ? 'Sự thiếu tự tin có thể khiến bạn do dự khi nắm bắt các cơ hội thực tập lâm sàng tốt hoặc ngại ngùng khi thảo luận ca trước các chuyên gia kỳ cựu.'
        : 'Nếu quá tự tin sớm, có thể chủ quan bỏ qua các tiêu chuẩn an toàn đạo đức hoặc đốt cháy giai đoạn thực hành có giám sát.'
    ],
    supervisionGuidance: 'Xây dựng Bản Kế hoạch Phát triển Cá nhân (IDP - Individual Development Plan) 3 năm. Tìm kiếm một Giám sát viên mang phong cách nuôi dưỡng (Nurturing Supervisor) để gia cố niềm tin tự hiệu năng.',
    compatibleEnvironments: [
      'Chương trình đào tạo Thạc sĩ Tâm lý học Lâm sàng/Tham vấn, hệ thống bệnh viện công lập, các viện nghiên cứu quốc tế'
    ]
  });

  return reports;
}
