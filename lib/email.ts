/**
 * Client-side email sending via our API route (which uses Resend server-side)
 */

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || 'https://pacific-travel.vercel.app');

export async function sendNewUserPendingEmail(opts: {
  adminEmails: string[];
  userName: string;
  userEmail: string;
  userPhone?: string;
}) {
  return fetch('/api/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'new_user_pending',
      to: opts.adminEmails,
      data: {
        userName: opts.userName,
        userEmail: opts.userEmail,
        userPhone: opts.userPhone,
        approveUrl: `${BASE_URL}/settings?tab=users`,
      },
    }),
  });
}

export async function sendUserApprovedEmail(opts: {
  userEmail: string;
  userName: string;
}) {
  return fetch('/api/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'user_approved',
      to: opts.userEmail,
      data: {
        userName: opts.userName,
        loginUrl: `${BASE_URL}/login`,
      },
    }),
  });
}
