import kleur from "kleur";

export class GithubAuthError extends Error {
  constructor() {
    super(`Github user not found, try ${kleur.red("login")} first`);
  }
}