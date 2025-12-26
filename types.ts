
export type Language = 'en' | 'ar';

export interface Grant {
  id: string;
  title: string;
  donor: string;
  deadline: string;
  description: string;
  amount?: string;
  sectors: string[];
  link: string;
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface ResearchResult {
  summary: string;
  grants: Grant[];
  sources: GroundingSource[];
}

export enum Sector {
  WASH = 'WASH',
  HEALTH = 'Health',
  EDUCATION = 'Education',
  FOOD_SECURITY = 'Food Security',
  PROTECTION = 'Protection',
  LIVELIHOODS = 'Livelihoods',
  SHELTER = 'Shelter/NFIs',
  CCCM = 'CCCM',
  PEACEBUILDING = 'Peacebuilding'
}
