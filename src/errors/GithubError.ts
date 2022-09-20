import kleur from "kleur";

export class GithubError extends Error {
  constructor() {
    super(`Github threw an ${kleur.red("unknown")} error`);
  };
};