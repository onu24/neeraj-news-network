export type ArticleStatus = 'draft' | 'review' | 'published';
export type ArticleType = 'standard' | 'opinion' | 'explainer' | 'video';
export type ArticleContentFont =
  | 'serif'
  | 'sans'
  | 'mono'
  | 'roboto'
  | 'poppins'
  | 'merriweather'
  | 'playfair';

export interface Category {
  id: string;
  name: string; // Internal/Default (usually Hindi now)
  name_hi: string; // Explicit Hindi
  name_en?: string; // Optional English translation
  slug: string;
  description?: string;
  description_hi?: string;
  order?: number;
  metaTitle?: string;
  metaDescription?: string;
}

export interface Author {
  id: string;
  name: string;
  bio: string;
  avatar: string; // Unified Avatar
  email?: string;
  role?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
  };
}

export interface Article {
  // Core Identifiers
  id: string;
  title: string;
  title_hi?: string;
  slug: string;
  
  // Content
  excerpt: string;
  excerpt_hi?: string;
  content: string;
  content_hi?: string;
  keyPoints?: string[];
  contentFont?: ArticleContentFont;
  articleType: ArticleType;
  
  // Media
  coverImage: string; // Unified Image
  galleryImages?: string[];
  videoUrl?: string; // For type: 'video'
  
  // Metadata & Taxonomy
  categoryId: string;
  category: string; // Display Name (EN)
  category_hi: string; // Display Name (HI)
  categorySlug: string;
  authorId: string;
  tags: string[];
  status: ArticleStatus;
  featured: boolean;
  language: 'en' | 'hi';
  
  // Statistics
  views: number;
  shares: number;
  readingTime: number;
  
  // Engagement
  isBreaking: boolean;
  isLive: boolean;
  
  // Timestamps
  createdAt: string; 
  updatedAt: string;

  // SEO Metadata
  metaTitle?: string;
  metaDescription?: string;
}

export interface NewsArticle extends Article {}

export interface DashboardStats {
  totalArticles: number;
  publishedCount: number;
  draftCount: number;
  reviewCount: number;
  featuredArticles: number;
  totalViews: number;
  totalShares: number;
  totalCategories: number;
  totalAuthors: number;
}

export interface VisualStory {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  category: string;
  slides: {
    id: string;
    title: string;
    caption: string;
    image: string;
    video?: string;
  }[];
  createdAt: string;
}

export interface AboutPageContent {
  id: string;
  heroTitle: string;
  heroTitle_hi?: string;
  heroSubtitle: string;
  heroSubtitle_hi?: string;
  profileImage: string;
  intro: string;
  intro_hi?: string;
  story: string;
  story_hi?: string;
  mission: string;
  mission_hi?: string;
  vision: string;
  vision_hi?: string;
  values: string[];
  values_hi?: string[];
  updatedAt: string;
}

export interface ContactPageContent {
  id: string;
  /** Page hero */
  heroTitle: string;
  heroTitle_hi?: string;
  heroSubtitle: string;
  heroSubtitle_hi?: string;
  /** Contact details shown on the left column */
  email: string;          // e.g. "editorial@drishyamnews.in\nbusiness@drishyamnews.in"
  phone: string;          // e.g. "+91 11 XXXX XXXX"
  address: string;        // e.g. "New Delhi, India"
  address_hi?: string;
  /** Optional extra rich-text block (plain text) */
  extraInfo: string;
  extraInfo_hi?: string;
  updatedAt: string;
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  isAdmin?: boolean;
}

export interface JobOpening {
  id: string;
  title: string;
  slug: string;
  location: string;
  type: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  coverLetter: string;
  resumeUrl: string; // Cloudinary URL
  createdAt: string;
}
