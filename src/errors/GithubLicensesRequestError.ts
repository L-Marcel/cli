import kleur from "kleur";

export class GithubLicensesRequestError extends Error {
  constructor() {
    super(`Github API threw an error on get ${kleur.red("licenses")}`);
  }
}