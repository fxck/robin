// Post types
export interface Post {
  id: string;
  userId: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  coverImageThumb: string | null;
  status: 'draft' | 'published';
  views: number;
  likesCount: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  author?: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export interface PostListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  coverImageThumb: string | null;
  status: 'draft' | 'published';
  views: number;
  likesCount: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export interface CreatePostInput {
  title: string;
  content: string;
  coverImage?: string;
  status?: 'draft' | 'published';
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  coverImage?: string;
  status?: 'draft' | 'published';
  version: number;
}

export interface PostsListResponse {
  posts: PostListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PostResponse {
  post: Post;
}

// Upload types
export interface UploadResponse {
  url: string;
  contentType: string;
  size: number;
}
