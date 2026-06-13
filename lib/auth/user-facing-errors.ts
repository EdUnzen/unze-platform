/** Auth-Fehler in professionelle UNZE-Meldungen übersetzen — keine Technik-Begriffe */

const AUTH_NOT_CONFIGURED =
  "Anmeldung ist derzeit nicht verfügbar. Bitte versuche es später erneut.";

export function authNotConfiguredMessage(): string {
  return AUTH_NOT_CONFIGURED;
}

export function mapAuthError(message: string): string {
  const lower = message.toLowerCase();

  if (
    lower.includes("invalid login credentials") ||
    lower.includes("invalid email or password")
  ) {
    return "E-Mail oder Passwort ist falsch.";
  }

  if (lower.includes("email not confirmed")) {
    return "Bitte bestätige zuerst deine E-Mail-Adresse.";
  }

  if (lower.includes("user already registered") || lower.includes("already been registered")) {
    return "Diese E-Mail ist bereits registriert. Melde dich an oder setze dein Passwort zurück.";
  }

  if (lower.includes("password") && lower.includes("weak")) {
    return "Passwort ist zu schwach — mindestens 8 Zeichen verwenden.";
  }

  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return "Zu viele Versuche. Bitte warte einen Moment und versuche es erneut.";
  }

  if (
    lower.includes("expired") ||
    lower.includes("invalid") && (lower.includes("token") || lower.includes("otp") || lower.includes("link"))
  ) {
    return "Link abgelaufen oder ungültig. Bitte fordere einen neuen an.";
  }

  if (lower.includes("signup") && lower.includes("disabled")) {
    return "Registrierung ist derzeit nicht möglich. Bitte später erneut versuchen.";
  }

  if (lower.includes("network") || lower.includes("fetch failed")) {
    return "Verbindungsfehler — bitte erneut versuchen.";
  }

  if (
    lower.includes("supabase") ||
    lower.includes("vercel") ||
    lower.includes("api") ||
    lower.includes("database") ||
    lower.includes("postgres") ||
    lower.includes("jwt")
  ) {
    return "Die Anmeldung konnte nicht abgeschlossen werden. Bitte erneut versuchen.";
  }

  return "Die Anmeldung konnte nicht abgeschlossen werden. Bitte erneut versuchen.";
}

export const AUTH_CALLBACK_ERRORS: Record<string, string> = {
  auth_callback_failed: "Anmeldung nach E-Mail-Bestätigung fehlgeschlagen. Bitte erneut anmelden.",
  email_verification_failed:
    "E-Mail-Verifizierung fehlgeschlagen. Bitte fordere einen neuen Bestätigungslink an.",
  password_reset_failed: "Passwort-Reset-Link ungültig oder abgelaufen.",
  service_unavailable: AUTH_NOT_CONFIGURED,
};
