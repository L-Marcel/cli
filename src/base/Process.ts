import kleur from "kleur";

export class Process {
  static info(message: string) {
    console.log(`${kleur.yellow("!")} ${message}`);
  }; 

  static err(message: string) {
    console.log(`${kleur.red("!")} ${message ?? `Unexpected process ${kleur.red("exit")} detected`}`);
  }; 

  static success(message: string) {
    console.log(`${kleur.green("✓")} ${message}`);
  };

  static run(callback: Function, ...params: any) {
    callback(...params)
      .then((res: any) => res)
      .catch((err: Error) => {
        console.log(err);
        this.err(err.message);
      });
  };
}