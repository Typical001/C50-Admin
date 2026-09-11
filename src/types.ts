export type UserRole = 'student' | 'admin' | 'teacher';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface Batch {
  overviewContent?: unknown;
  id: string;
  title: string;
  description: string;
  instructor: string;
  price: number;
  discountPrice: number;
  duration: string;
  totalLectures: number;
  notesCount: number;
  language: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  category: string;
  enrollmentCount: number;
  bannerUrl: string;
  thumbnailUrl: string;
  thumbnail_url?: string;
  lastUpdated: string;
  isFree: boolean;
  isPaid?: boolean;
  paymentEnabled?: boolean;
  razorpayPaymentButtonId?: string;
  rating?: number;
  ratingCount?: number;
  customTag?: string;
}

export interface Subject {
  id: string;
  batchId: string;
  title: string;
  description: string;
}

export interface Chapter {
  id: string;
  subjectId: string;
  title: string;
  description: string;
}

export interface Lecture {
  id: string;
  chapterId: string;
  title: string;
  description: string;
  videoUrl: string;
  video_url?: string;
  notesUrl?: string;
  notes_url?: string;
  notesTitle?: string;
  notes_title?: string;
  duration: string;
  attachments?: string[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'notice' | 'update' | 'maintenance' | 'course';
  authorId: string;
  createdAt: string;
  batchId?: string | null;
}

export interface HomepageSettings {
  id: string;
  hero_title: string;
  hero_subtitle: string;
  faqs: { question: string; answer: string }[];
  testimonials: { name: string; role: string; text: string }[];
  faculties?: { name: string; role: string; bio: string; imageUrl?: string }[];
  show_hero?: boolean;
  show_faq?: boolean;
  show_testimonials?: boolean;
  show_faculty?: boolean;
  updated_at: string;
}
