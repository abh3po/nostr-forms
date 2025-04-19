import { tshirtSignupTemplate } from './tshirtSignup';
import { eventFeedbackTemplate } from './eventFeedback';
import { customerFeedbackTemplate } from './customerFeedback';
import { orderFormTemplate } from './orderForm';
import { workRequestTemplate } from './workRequest';
import { taskTrackingTemplate } from './taskTracking';
import { meetingNotesTemplate } from './meetingNotes';
import { blankQuizTemplate } from './blankQuiz';
import { courseEvaluationTemplate } from './courseEvaluation';
import { exitTicketTemplate } from './exitTicket';
import { assessmentTemplate } from './assessment';
import { studentInterestSurveyTemplate } from './studentInterestSurvey';
import { newsletterSignupTemplate } from './newsletterSignup';
import { helpdeskTicketTemplate } from './helpdeskTicket';
import { blankTemplate } from './blank';
import { rsvpTemplate } from './rsvp';
import { contactInfoTemplate } from './contactInfo';
import { eventRegistrationTemplate } from './eventRegistration';
import { partyInviteTemplate } from './partyInvite';
import { FormTemplate } from './types';

export const availableTemplates: FormTemplate[] = [
  blankTemplate,
  rsvpTemplate,
  contactInfoTemplate,
  partyInviteTemplate,
  eventRegistrationTemplate,
  tshirtSignupTemplate,
  eventFeedbackTemplate,
  customerFeedbackTemplate,
  orderFormTemplate,
  workRequestTemplate,
  taskTrackingTemplate,
  meetingNotesTemplate,
  blankQuizTemplate,
  courseEvaluationTemplate,
  exitTicketTemplate,
  assessmentTemplate,
  studentInterestSurveyTemplate,
  newsletterSignupTemplate,
  helpdeskTicketTemplate,
];

export const initialTemplates: FormTemplate[] = [
  blankTemplate,
  contactInfoTemplate,
  rsvpTemplate,
  partyInviteTemplate,
  eventRegistrationTemplate,
  tshirtSignupTemplate,
];

export * from './types';