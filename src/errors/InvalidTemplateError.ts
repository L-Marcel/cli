import kleur from "kleur";

export class InvalidTemplateError extends Error {
  constructor() {
    super(`Template not found, check ${kleur.red("compatibility")}`);
  }
}