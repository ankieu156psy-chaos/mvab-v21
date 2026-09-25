/**
 * O*NET Empirical Normative Benchmark Matrix (v28.2)
 * Trích xuất trực tiếp từ cơ sở dữ liệu O*NET Database (U.S. Department of Labor)
 * Cho 9 Cụm Nghề Nghiệp Tâm Lý Học MVAB v2.1
 * 
 * Thuật toán so khớp: Standardized Mahalanobis Distance (DM)
 * Thay thế hoàn toàn Cosine Similarity để:
 * - Bảo toàn Elevation (độ lớn vector năng lực)
 * - Khắc phục sai số hình nón siêu cầu hẹp [0.82, 0.98]
 * - Chuẩn hóa phương sai từng trục độc lập
 */

export interface OnetRawMetrics {
  stressTolerance: number;
  concernForOthers: number;
  selfControl: number;
  analyticalThinking: number;
  adaptability: number;
  investigative: number;
  social: number;
  enterprising: number;
  conventional: number;
}

export interface OnetTargetVector {
  d1: number;
  d2: number;
  d3: number;
  d4: number;
  d5_pt: number;
  d5_pd: number;
  d6: number;
  d7: number;
  d8: number;
}

export interface OnetBenchmarkProfile {
  clusterId: string;
  socCode: string;
  title: string;
  name: string;
  rawOnet: OnetRawMetrics;
  targetVector: OnetTargetVector;
  sigmaVector: OnetTargetVector;
}

export const ONET_BENCHMARK_PROFILES: OnetBenchmarkProfile[] = [
  {
    "clusterId": "cluster_1",
    "socCode": "19-3033.00",
    "title": "Clinical Psychologists",
    "name": "Cụm 1: Tâm lý học Lâm sàng & Sức khỏe Y tế",
    "rawOnet": {
      "stressTolerance": 4.77,
      "concernForOthers": 4.91,
      "selfControl": 4.82,
      "analyticalThinking": 3.84,
      "adaptability": 4.18,
      "investigative": 5.5,
      "social": 6.57,
      "enterprising": 2.67,
      "conventional": 3.55
    },
    "targetVector": {
      "d1": 64,
      "d2": 61,
      "d3": 64,
      "d4": 73,
      "d5_pt": 79,
      "d5_pd": 3,
      "d6": 74,
      "d7": 79,
      "d8": 69
    },
    "sigmaVector": {
      "d1": 9.5,
      "d2": 10,
      "d3": 9,
      "d4": 10.2,
      "d5_pt": 8.8,
      "d5_pd": 9.2,
      "d6": 9.8,
      "d7": 8.5,
      "d8": 9
    }
  },
  {
    "clusterId": "cluster_2",
    "socCode": "21-1014.00",
    "title": "Mental Health Counselors",
    "name": "Cụm 2: Tham vấn Tâm lý & Trị liệu Ngoại trú Phi Y tế",
    "rawOnet": {
      "stressTolerance": 4.72,
      "concernForOthers": 4.93,
      "selfControl": 4.67,
      "analyticalThinking": 3.95,
      "adaptability": 4.41,
      "investigative": 4.44,
      "social": 6.76,
      "enterprising": 2.91,
      "conventional": 3.45
    },
    "targetVector": {
      "d1": 65,
      "d2": 65,
      "d3": 79,
      "d4": 75,
      "d5_pt": 79,
      "d5_pd": 5,
      "d6": 75,
      "d7": 79,
      "d8": 67
    },
    "sigmaVector": {
      "d1": 9.5,
      "d2": 10,
      "d3": 9,
      "d4": 10.2,
      "d5_pt": 8.8,
      "d5_pd": 9.2,
      "d6": 9.8,
      "d7": 8.5,
      "d8": 9
    }
  },
  {
    "clusterId": "cluster_3",
    "socCode": "19-3034.00",
    "title": "School Psychologists",
    "name": "Cụm 3: Tâm lý học Học đường & Can thiệp Phát triển",
    "rawOnet": {
      "stressTolerance": 4.56,
      "concernForOthers": 4.56,
      "selfControl": 4.72,
      "analyticalThinking": 4.34,
      "adaptability": 4.56,
      "investigative": 5,
      "social": 6.77,
      "enterprising": 2.82,
      "conventional": 4.01
    },
    "targetVector": {
      "d1": 76,
      "d2": 67,
      "d3": 76,
      "d4": 76,
      "d5_pt": 73,
      "d5_pd": 5,
      "d6": 74,
      "d7": 73,
      "d8": 73
    },
    "sigmaVector": {
      "d1": 9.5,
      "d2": 10,
      "d3": 9,
      "d4": 10.2,
      "d5_pt": 8.8,
      "d5_pd": 9.2,
      "d6": 9.8,
      "d7": 8.5,
      "d8": 9
    }
  },
  {
    "clusterId": "cluster_4",
    "socCode": "19-3032.00",
    "title": "Industrial-Organizational Psychologists",
    "name": "Cụm 4: Tâm lý Tổ chức, Doanh nghiệp & Quản trị Nhân sự (I/O)",
    "rawOnet": {
      "stressTolerance": 3.92,
      "concernForOthers": 3.77,
      "selfControl": 4.04,
      "analyticalThinking": 4.69,
      "adaptability": 4.31,
      "investigative": 5.32,
      "social": 4.18,
      "enterprising": 4.65,
      "conventional": 4.04
    },
    "targetVector": {
      "d1": 67,
      "d2": 66,
      "d3": 57,
      "d4": 53,
      "d5_pt": 62,
      "d5_pd": 15,
      "d6": 58,
      "d7": 62,
      "d8": 70
    },
    "sigmaVector": {
      "d1": 9.5,
      "d2": 10,
      "d3": 9,
      "d4": 10.2,
      "d5_pt": 8.8,
      "d5_pd": 9.2,
      "d6": 9.8,
      "d7": 8.5,
      "d8": 9
    }
  },
  {
    "clusterId": "cluster_5",
    "socCode": "19-3022.00",
    "title": "Survey Researchers",
    "name": "Cụm 5: Tâm lý Tiêu dùng, Tiếp thị & Kinh tế Hành vi",
    "rawOnet": {
      "stressTolerance": 3.83,
      "concernForOthers": 3.12,
      "selfControl": 3.62,
      "analyticalThinking": 4.58,
      "adaptability": 3.83,
      "investigative": 6.1,
      "social": 2.31,
      "enterprising": 3.05,
      "conventional": 5.46
    },
    "targetVector": {
      "d1": 67,
      "d2": 60,
      "d3": 43,
      "d4": 71,
      "d5_pt": 52,
      "d5_pd": 19,
      "d6": 53,
      "d7": 52,
      "d8": 65
    },
    "sigmaVector": {
      "d1": 9.5,
      "d2": 10,
      "d3": 9,
      "d4": 10.2,
      "d5_pt": 8.8,
      "d5_pd": 9.2,
      "d6": 9.8,
      "d7": 8.5,
      "d8": 9
    }
  },
  {
    "clusterId": "cluster_6",
    "socCode": "17-2112.01",
    "title": "Human Factors Engineers and Ergonomists",
    "name": "Cụm 6: Công thái Nhận thức, Trải nghiệm Người dùng (UX) & Não bộ",
    "rawOnet": {
      "stressTolerance": 4,
      "concernForOthers": 4,
      "selfControl": 3.86,
      "analyticalThinking": 4.48,
      "adaptability": 4.19,
      "investigative": 6.22,
      "social": 2.2,
      "enterprising": 2.65,
      "conventional": 4.24
    },
    "targetVector": {
      "d1": 69,
      "d2": 64,
      "d3": 49,
      "d4": 72,
      "d5_pt": 65,
      "d5_pd": 16,
      "d6": 60,
      "d7": 65,
      "d8": 65
    },
    "sigmaVector": {
      "d1": 9.5,
      "d2": 10,
      "d3": 9,
      "d4": 10.2,
      "d5_pt": 8.8,
      "d5_pd": 9.2,
      "d6": 9.8,
      "d7": 8.5,
      "d8": 9
    }
  },
  {
    "clusterId": "cluster_7",
    "socCode": "19-3039.00",
    "title": "Psychologists, All Other (Sports & Performance)",
    "name": "Cụm 7: Tâm lý Thể thao, Hiệu suất Đỉnh cao & Nghệ thuật",
    "rawOnet": {
      "stressTolerance": 0,
      "concernForOthers": 0,
      "selfControl": 0,
      "analyticalThinking": 0,
      "adaptability": 0,
      "investigative": 0,
      "social": 0,
      "enterprising": 0,
      "conventional": 0
    },
    "targetVector": {
      "d1": 68,
      "d2": 62,
      "d3": 69,
      "d4": 67,
      "d5_pt": 74,
      "d5_pd": 7,
      "d6": 70,
      "d7": 76,
      "d8": 69
    },
    "sigmaVector": {
      "d1": 9.5,
      "d2": 10,
      "d3": 9,
      "d4": 10.2,
      "d5_pt": 8.8,
      "d5_pd": 9.2,
      "d6": 9.8,
      "d7": 8.5,
      "d8": 9
    }
  },
  {
    "clusterId": "cluster_8",
    "socCode": "19-3039.00",
    "title": "Psychologists, All Other (Forensic & Law)",
    "name": "Cụm 8: Tâm lý Pháp y, Tội phạm & An ninh Tư pháp",
    "rawOnet": {
      "stressTolerance": 0,
      "concernForOthers": 0,
      "selfControl": 0,
      "analyticalThinking": 0,
      "adaptability": 0,
      "investigative": 0,
      "social": 0,
      "enterprising": 0,
      "conventional": 0
    },
    "targetVector": {
      "d1": 68,
      "d2": 62,
      "d3": 63,
      "d4": 67,
      "d5_pt": 74,
      "d5_pd": 7,
      "d6": 70,
      "d7": 76,
      "d8": 69
    },
    "sigmaVector": {
      "d1": 9.5,
      "d2": 10,
      "d3": 9,
      "d4": 10.2,
      "d5_pt": 8.8,
      "d5_pd": 9.2,
      "d6": 9.8,
      "d7": 8.5,
      "d8": 9
    }
  },
  {
    "clusterId": "cluster_9",
    "socCode": "25-1066.00",
    "title": "Psychology Teachers, Postsecondary",
    "name": "Cụm 9: Nghiên cứu Học thuật, Giảng dạy & Đo lường Tâm trắc",
    "rawOnet": {
      "stressTolerance": 4.36,
      "concernForOthers": 4.39,
      "selfControl": 4.51,
      "analyticalThinking": 4.69,
      "adaptability": 4.36,
      "investigative": 5.56,
      "social": 7,
      "enterprising": 2.37,
      "conventional": 3.26
    },
    "targetVector": {
      "d1": 72,
      "d2": 69,
      "d3": 71,
      "d4": 66,
      "d5_pt": 71,
      "d5_pd": 8,
      "d6": 69,
      "d7": 71,
      "d8": 77
    },
    "sigmaVector": {
      "d1": 9.5,
      "d2": 10,
      "d3": 9,
      "d4": 10.2,
      "d5_pt": 8.8,
      "d5_pd": 9.2,
      "d6": 9.8,
      "d7": 8.5,
      "d8": 9
    }
  }
];

/**
 * Tính toán Khoảng cách Mahalanobis Chuẩn hóa (Standardized Mahalanobis Distance)
 * và chuyển đổi thành Chỉ số Tương thích % (Fit Percentage)
 * 
 * @param userScores Phổ điểm thực tế của người làm test (T-Scores)
 * @param benchmark Hồ sơ chuẩn O*NET của cụm nghề
 */
export function calculateMahalanobisFit(
  userVector: OnetTargetVector,
  benchmark: OnetBenchmarkProfile
): {
  matchPercentage: number;
  mahalanobisDistance: number;
  axisDeltas: Record<keyof OnetTargetVector, number>;
} {
  const target = benchmark.targetVector;
  const sigma = benchmark.sigmaVector;

  const axes: (keyof OnetTargetVector)[] = [
    'd1', 'd2', 'd3', 'd4', 'd5_pt', 'd5_pd', 'd6', 'd7', 'd8'
  ];

  let sumSquaredDelta = 0;
  const axisDeltas: any = {};

  for (const axis of axes) {
    const diff = userVector[axis] - target[axis];
    const s = sigma[axis] || 10;
    const stdDiff = diff / s;
    sumSquaredDelta += stdDiff * stdDiff;
    axisDeltas[axis] = Math.round(diff);
  }

  // Mahalanobis distance D_M
  const mahalanobisDistance = Math.sqrt(sumSquaredDelta);

  // Chuyển đổi khoảng cách Mahalanobis thành % tương thích (Fit Percentage)
  // Khi DM = 0 (khớp hoàn hảo) -> 98%
  // Khi DM = 1.5 -> ~88%
  // Khi DM = 3.0 -> ~68%
  // Khi DM > 4.5 -> ~40%
  const normalizedMatch = Math.round(98 * Math.exp(-0.038 * sumSquaredDelta));
  const matchPercentage = Math.max(35, Math.min(98, normalizedMatch));

  return {
    matchPercentage,
    mahalanobisDistance: Math.round(mahalanobisDistance * 100) / 100,
    axisDeltas
  };
}
