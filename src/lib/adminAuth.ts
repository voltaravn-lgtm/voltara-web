export const ADMIN_EMAILS = ["voltaravn@gmail.com", "tuanmanhbh@gmail.com"];

export function isAdminEmail(email?: string | null) {
  return Boolean(email && ADMIN_EMAILS.includes(email.toLowerCase()));
}
