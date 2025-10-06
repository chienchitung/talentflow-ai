
export enum RecruitmentStage {
  NEW_APPLICATION = '新申請',
  SCREENING = '篩選中',
  INTERVIEW = '面試中',
  OFFER = '錄取通知',
  HIRED = '已報到',
  REJECTED = '未錄取',
}

export enum ApplicantSource {
  WEBSITE = '官方網站',
  LINKEDIN = 'LinkedIn',
  REFERRAL = '內部推薦',
  OTHER = '其他',
}

export enum JobStatus {
    DRAFT = '草稿',
    PUBLISHED = '發佈中',
    CLOSED = '已關閉',
}

export interface Interviewer {
    id: string;
    name: string;
}

export interface Feedback {
    id: string;
    author: string;
    comment: string;
    rating: number; // 1-5
}

export interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  resumeUrl: string; // link to a dummy pdf
  jobId: string;
  stage: RecruitmentStage;
  source: ApplicantSource;
  applicationDate: string;
  feedback: Feedback[];
  interviewTime?: string;
  interviewers?: Interviewer[];
}

export interface Job {
  id:string;
  title: string;
  department: string;
  description: string;
  requirements: string;
  benefits: string;
  status: JobStatus;
  views: number;
  createdAt: string;
  niceToHave?: string;
  teamIntro?: string;
  techStack?: string;
  growthOpportunities?: string;
}