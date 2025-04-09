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
];

export * from './types';