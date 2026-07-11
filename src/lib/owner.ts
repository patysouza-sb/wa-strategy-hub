// E-mail do dono do projeto — tem acesso vitalício ao painel,
// independentemente do status da assinatura.
export const OWNER_EMAILS = ["patysouza128@gmail.com"];

export const isOwner = (email?: string | null) =>
  !!email && OWNER_EMAILS.includes(email.toLowerCase());
