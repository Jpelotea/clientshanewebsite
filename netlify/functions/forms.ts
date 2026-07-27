import type { Config, Context } from '@netlify/functions';
import { assertAllowedOrigin, assertBodySize, jsonResponse, PublicError, safeMessage } from './_shared/http';
import { verifyTurnstile } from './_shared/turnstile';
import { assertHoneypot, contactSchema, consultationSchema, parseWithSchema, recruitmentSchema, textFields } from './_shared/validation';
import { deleteResume, storeResume } from './_shared/storage';
import { sendContact, sendConsultation, sendRecruitment } from './_shared/email';

export default async function handler(request: Request, context: Context): Promise<Response> {
  try {
    if (request.method !== 'POST') {
      return jsonResponse({ message: 'Method not allowed.' }, 405, { Allow: 'POST' });
    }
    assertAllowedOrigin(request);
    assertBodySize(request);

    const formType = context.params.formType;
    if (!formType || !['recruitment', 'consultation', 'contact'].includes(formType)) {
      throw new PublicError('Unknown form type.', 404);
    }

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data') && !contentType.includes('application/x-www-form-urlencoded')) {
      throw new PublicError('Unsupported form format.', 415);
    }

    const formData = await request.formData();
    const fields = textFields(formData);
    assertHoneypot(fields);
    await verifyTurnstile(fields['cf-turnstile-response'] || '', context.ip);

    if (formType === 'recruitment') {
      const data = parseWithSchema(recruitmentSchema, fields);
      const file = formData.get('resume');
      if (!(file instanceof File)) {
        throw new PublicError('A résumé file is required.', 400, { resume: 'Select a résumé file.' });
      }
      const stored = await storeResume(file);
      try {
        await sendRecruitment(data, stored);
      } catch (error) {
        await deleteResume(stored.key).catch(() => {
          console.error('An orphaned résumé object could not be removed after notification failure.');
        });
        throw error;
      }
      return jsonResponse({ message: 'Your application was submitted securely for review. Qualified applicants will be contacted manually.' }, 201);
    }

    if (formType === 'consultation') {
      const data = parseWithSchema(consultationSchema, fields);
      await sendConsultation(data);
      return jsonResponse({ message: 'Your consultation request was received. The preferred schedule is not yet confirmed and will be reviewed manually.' }, 201);
    }

    const data = parseWithSchema(contactSchema, fields);
    await sendContact(data);
    return jsonResponse({ message: 'Your inquiry was received and will be reviewed by an authorized recipient.' }, 201);
  } catch (error) {
    const result = safeMessage(error);
    return jsonResponse({ message: result.message, errors: result.errors }, result.status);
  }
}

export const config: Config = {
  path: '/api/forms/:formType',
  method: 'POST',
  rateLimit: {
    action: 'rate_limit',
    windowLimit: 12,
    windowSize: 180,
    aggregateBy: ['domain', 'ip']
  }
};
