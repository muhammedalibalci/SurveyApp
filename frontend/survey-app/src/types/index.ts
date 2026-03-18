export interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AnswerOption {
  id: number;
  text: string;
  order: number;
}

export interface AnswerTemplate {
  id: number;
  name: string;
  createdAt: string;
  options: AnswerOption[];
}

export interface CreateAnswerTemplateRequest {
  name: string;
  options: { text: string; order: number }[];
}

export interface Question {
  id: number;
  text: string;
  answerTemplateId: number;
  answerTemplateName: string;
  options: AnswerOption[];
  createdAt: string;
}

export interface CreateQuestionRequest {
  text: string;
  answerTemplateId: number;
}

export interface SurveyQuestion {
  questionId: number;
  text: string;
  order: number;
  answerTemplateId: number;
  answerTemplateName: string;
  options: AnswerOption[];
}

export interface Survey {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  questions: SurveyQuestion[];
  assignedUsers: User[];
}

export interface SurveyListItem {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  questionCount: number;
  assignedUserCount: number;
  responseCount: number;
  createdAt: string;
}

export interface CreateSurveyRequest {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  questions: { questionId: number; order: number }[];
  assignedUserIds: number[];
}

export interface UserSurvey {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  questionCount: number;
  isCompleted: boolean;
}

export interface SubmitSurveyRequest {
  surveyId: number;
  answers: { questionId: number; selectedOptionId: number }[];
}

export interface UserAnswer {
  questionId: number;
  questionText: string;
  selectedOptionText: string;
  selectedOptionId: number;
}

export interface UserResponse {
  responseId: number;
  user: User;
  submittedAt: string;
  answers: UserAnswer[];
}

export interface SurveyReport {
  surveyId: number;
  surveyTitle: string;
  totalAssigned: number;
  totalCompleted: number;
  completedResponses: UserResponse[];
  pendingUsers: User[];
}
