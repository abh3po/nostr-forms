import { blankTemplate } from './blank';
import { contactInfoTemplate } from './contactInfo';
import { eventRegistrationTemplate } from './eventRegistration';
import { partyInviteTemplate } from './partyInvite';
import { rsvpTemplate } from './rsvp';
import { FormTemplate } from './types';

export const availableTemplates: FormTemplate[] = [
  blankTemplate,
  rsvpTemplate,
  contactInfoTemplate,
  partyInviteTemplate,
  eventRegistrationTemplate,
];

export * from './types';
