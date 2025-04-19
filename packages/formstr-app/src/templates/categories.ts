export interface TemplateCategory {
    id: string;
    title: string;
    templateIds: string[];
  }
  
  export const templateCategories: TemplateCategory[] = [
    {
      id: 'personal',
      title: 'Personal',
      templateIds: [
        'contactInfo',
        'partyInvite',
        'tshirtSignup',
        'rsvp',
        'eventRegistration',
      ],
    },
    {
      id: 'work',
      title: 'Work',
      templateIds: [
        'customerFeedback',
        'orderForm',
        'eventFeedback',
        'workRequest',
        'newsletterSignup',
        'taskTracking',
        'meetingNotes',
        'helpdeskTicket',
      ],
    },
    {
      id: 'education',
      title: 'Education',
      templateIds: [
        'blankQuiz',
        'courseEvaluation',
        'exitTicket',
        'assessment',
        'studentInterestSurvey',
      ],
    },
  ];
  
  import { FormTemplate } from './types';
  
  export const groupTemplatesByCategory = (
    templates: FormTemplate[],
    categories: TemplateCategory[]
  ): { category: TemplateCategory; templates: FormTemplate[] }[] => {
    const templateMap = new Map(templates.map(t => [t.id, t]));
    return categories.map(category => ({
      category,
      templates: category.templateIds
        .map(id => templateMap.get(id))
        .filter((t): t is FormTemplate => t !== undefined),
    })).filter(group => group.templates.length > 0); 
  };