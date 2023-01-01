import kleur from "kleur";

export class RepositoryCommitError extends Error {
  constructor() {
    super(`Error on push a ${kleur.red("commit")}`);
  }
}