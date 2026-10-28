export const SIGN_IN_MESSAGES = {
  wrong: "E-mail ou senha incorretos.",
  forbidden: "Este acesso não tem permissão para o painel.",
} as const;

export type SignInState = { error: string | null; email: string };
