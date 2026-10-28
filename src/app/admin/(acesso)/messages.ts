export const SIGN_IN_MESSAGES = {
  wrong: "E-mail ou senha incorretos.",
  forbidden: "Este acesso não tem permissão para o painel.",
} as const;

export type SignInState = { error: string | null; email: string };

export const RESET_MESSAGES = {
  sent: "Se o e-mail estiver cadastrado, você vai receber um link para criar uma nova senha.",
  badLink: "O link expirou ou já foi usado. Peça um novo.",
  short: "Use ao menos 8 caracteres.",
  failed: "Não foi possível salvar a senha. Tente de novo.",
} as const;

export type FormState = { message: string | null };
