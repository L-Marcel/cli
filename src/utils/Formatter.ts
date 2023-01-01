export class Formatter {
  static replaceSpaces(value: string) {
    return value.replace(/ /g, "-");
  }
}