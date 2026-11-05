export type LensId = 'biographical' | 'tzimtzum' | 'buddhist' | 'synthesis';
export type ThreeId = Exclude<LensId, 'synthesis'>;

export interface Reading {
  lens: LensId;
  distill: string | null;
  images: { url: string; at?: string }[];
  updated_at?: string;
  content?: Record<string, unknown>;
}

export interface Case {
  id: string;
  code: string;
  title: string | null;
  created_at: string;
  risk_level: 'none' | 'concern' | 'acute';
  merhav_readings: Reading[];
}

export interface Section {
  lens: ThreeId;
  heading: string;
  insight: string;
  body: string;
}

export interface ArticleContent {
  title: string;
  subtitle: string;
  lede: string;
  sections: Section[];
  synthesis: { heading: string; insight: string; body: string };
  quote: string;
  haiku: string[];
  turn: { from: string; to: string };
  action: string;
  visual_prompt_he: string;
}

export interface Article {
  id: string;
  case_id: string | null;
  case_code: string | null;
  case_title: string | null;
  content: ArticleContent;
  share: Partial<Record<LensId, number>>;
  model: string | null;
  created_at: string;
}
