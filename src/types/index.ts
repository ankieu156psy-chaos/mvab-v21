export type Dimension = 
  | 'D1' // Không gian Can thiệp (Micro / Meso / Macro / Flexible)
  | 'D2' // Dung nạp Mơ hồ (Intolerance / Structure / Novelty)
  | 'D3' // Phong cách Thực hành (Empirical / Relational / Technological)
  | 'D4' // Định hướng Đối tượng (People / Things / Data)
  | 'D5' // Cân bằng Thấu cảm (Perspective Taking / Personal Distress)
  | 'D6' // Năng lực Tâm thần hóa (Certainty / Uncertainty)
  | 'D7' // Động cơ Vị tha (Healthy Altruism / Self-Sacrifice)
  | 'D8' // Dự phóng Nghề nghiệp (Future Utility / Efficacy / Defense)
  | 'IER'; // Insufficient Effort Responding (Kiểm soát chất lượng)

export interface TestItem {
  stt: number;
  id: string;
  dim: Dimension;
  subscale: string;
  text: string;
  polarity: 1 | -1;
  maxScore: number;
}

export interface UserResponse {
  itemId: string;
  value: number; // 1 to 5
  latencyMs: number; // Thời gian phản hồi tính bằng mili-giây
  answeredAt: number; // Timestamp
}

export interface CheckpointChoice {
  dimension: Dimension;
  choice: 'read_detail' | 'skip_continue';
  dwellTimeMs: number;
  timestamp: number;
}

export interface DimensionScores {
  // D1
  d1_micro: number;
  d1_meso: number;
  d1_macro: number;
  d1_micro_t: number;
  d1_meso_t: number;
  d1_macro_t: number;

  // D2
  d2_ambiguity: number;
  d2_amb_t: number;

  // D3
  d3_emp: number;
  d3_rel: number;
  d3_tec: number;
  d3_emp_t: number;
  d3_rel_t: number;
  d3_tec_t: number;

  // D4
  d4_people: number;
  d4_things: number;
  d4_data: number;
  d4_people_t: number;
  d4_things_t: number;
  d4_data_t: number;

  // D5
  d5_pt: number;
  d5_pd: number;
  d5_pt_t: number;
  d5_pd_t: number;

  // D6
  d6_mentalizing: number;
  d6_rfq_t: number;

  // D7
  d7_healthy: number;
  d7_sacrifice: number;
  d7_hea_t: number;
  d7_sac_t: number;

  // D8
  d8_utility: number;
  d8_efficacy: number;
  d8_defense: number;
  d8_fut_t: number;
  d8_fse_t: number;
  d8_fde_t: number;
}

export interface IERAuditResult {
  flags: number;
  details: string[];
  status: 'valid' | 'warning' | 'invalid';
}

export interface CareerMatch {
  id: string;
  name: string;
  match: number; // 0 - 100%
  apa: string;
  legal: string;
  desc: string;
}

export interface ConfiguralRuleResult {
  id: string;
  name: string;
  triggered: boolean;
  type: 'positive' | 'warning' | 'critical';
  feedback: string;
  roadmap: string;
}

export interface DimensionInsight {
  dimension: Dimension;
  title: string;
  teaser: string;
  detail: string;
}
