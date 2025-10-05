// src/types/University.ts
export interface University {
  id: string; // Unique identifier
  name: string; // University Name
  ranking: number; // For ranking data
  studentCount: number; // For student count data
  country: string; // Country where the university is located
  imageUrl: string;
}