import kleur from "kleur";

export class GithubRepositoryNotFound extends Error {
  constructor(repositoryName: string) {
    super(`Repository ${kleur.red(repositoryName)} not found`);
  }
}