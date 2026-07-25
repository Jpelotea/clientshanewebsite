import { z } from 'zod';
import { PublicError } from './http';

const cleanString = z.string().transform(value => value.replaceAll('\0', '').trim());
const limited = (minimum: number, maximum: number, label: string) =>
  cleanString.pipe(z.string().min(minimum, `${label} is required.`).max(maximum, `${label} is too long.`));
const optionalLimited = (maximum: number) => cleanString.pipe(z.string().max(maximum)).optional().default('');
const consent = z.literal('yes', { error: 'Required consent was not provided.' });
const mobile = limited(7, 40, 'Mobile number').refine(value => /^[+\d][\d\s().-]{6,39}$/.test(value), 'Enter a valid mobile number.');
const isoDate = limited(10, 10, 'Date').refine(value => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)), 'Enter a valid date.');
const timeValue = limited(5, 5, 'Time').refine(value => /^([01]\d|2[0-3]):[0-5]\d$/.test(value), 'Enter a valid time.');

const yearsExperienceOptions = ['Less than 2 years', '2–4 years', '5–9 years', '10 years or more'] as const;
const opportunityOptions = ['Financial Advisor career', 'Leadership opportunity', 'Career transition discussion'] as const;
const contactMethodOptions = ['Email', 'Mobile call', 'SMS', 'Messenger'] as const;

export const recruitmentSchema = z.object({
  fullName: limited(2, 120, 'Full name'),
  email: cleanString.pipe(z.string().email('Enter a valid email address.').max(160)),
  mobile,
  location: limited(2, 120, 'Location'),
  profession: limited(2, 120, 'Current profession'),
  employer: optionalLimited(140),
  education: limited(2, 180, 'Educational background'),
  yearsExperience: z.enum(yearsExperienceOptions, { error: 'Select a valid experience range.' }),
  opportunity: z.enum(opportunityOptions, { error: 'Select a valid opportunity.' }),
  contactMethod: z.enum(contactMethodOptions, { error: 'Select a valid contact method.' }),
  reason: limited(20, 1800, 'Reason for applying'),
  strengths: limited(20, 1800, 'Relevant strengths'),
  leadershipExperience: optionalLimited(1400),
  interviewAvailability: limited(5, 600, 'Interview availability'),
  dataConsent: consent,
  accuracyConfirmation: consent
});

export const consultationSchema = z.object({
  fullName: limited(2, 120, 'Full name'),
  email: cleanString.pipe(z.string().email('Enter a valid email address.').max(160)),
  mobile,
  consultationType: z.enum([
    'Financial Consultation — 30 minutes',
    'Career Opportunity Discussion — 30 minutes',
    'Leadership Opportunity Discussion — 45 minutes'
  ]),
  preferredDate: isoDate,
  preferredTime: timeValue,
  alternativeDate: isoDate,
  alternativeTime: timeValue,
  contactMethod: z.enum(contactMethodOptions, { error: 'Select a valid contact method.' }),
  reason: limited(10, 1600, 'Primary reason'),
  background: optionalLimited(1800),
  dataConsent: consent
}).superRefine((value, context) => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  for (const key of ['preferredDate', 'alternativeDate'] as const) {
    const date = new Date(`${value[key]}T00:00:00Z`);
    if (date < today) context.addIssue({ code: 'custom', path: [key], message: 'Choose a current or future date.' });
  }
});

export const contactSchema = z.object({
  fullName: limited(2, 120, 'Full name'),
  email: cleanString.pipe(z.string().email('Enter a valid email address.').max(160)),
  mobile: optionalLimited(40).refine(value => value === '' || /^[+\d][\d\s().-]{6,39}$/.test(value), 'Enter a valid mobile number.'),
  subject: limited(2, 160, 'Subject'),
  message: limited(10, 2200, 'Message'),
  dataConsent: consent
});

export function textFields(formData: FormData): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') result[key] = value;
  }
  return result;
}

export function parseWithSchema<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (result.success) return result.data;

  const fieldErrors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? 'form');
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  throw new PublicError('Review the form and correct the highlighted information.', 400, fieldErrors);
}

export function assertHoneypot(fields: Record<string, string>): void {
  if (fields.website) throw new PublicError('The submission could not be accepted.', 400);
}
