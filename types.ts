// Types pour les données PSN
// Fichier autonome, pas d'imports du projet

export type Cookie = { 
  name: string; 
  value: string; 
  domain?: string; 
};

export interface PSNLogbookResponse {
  structures?: Array<{
    individuals?: Array<{
      profile?: {
        firstName?: string;
        lastName?: string;
      };
      notation?: {
        grades?: PSNGrade[];
      };
      work?: {
        homework?: PSNHomework[];
      };
    }>;
  }>;
}

export interface PSNGrade {
  id?: string;
  grade: string;  // "16,00" format with comma
  scale: string;  // "20"
  date: string;
  subject?: string;  // Direct subject name
  subjectId?: string;
}

export interface PSNHomework {
  id?: string;
  date: string;
  description?: string;
  subjectId?: string;
  subject?: string | { name?: string };  // Can be string or object
  done?: boolean;
}
