import kleur from "kleur";
import { GithubAuthError } from "../errors/GithubAuthError";
import { Auth } from "./services/Auth";
export class Process {
  static info(message: string) {
    console.log(`${kleur.yellow("!")} ${message}`);
  } 

  static err(message: string) {
    console.log(`${kleur.red("!")} ${message ?? `Unexpected process ${kleur.red("exit")} detected`}`);
  } 

  static success(message: string) {
    console.log(`${kleur.green("✓")} ${message}`);
  }

  private static printError(err: Error) {
    Process.err(err.message);
  }

  static run(callback: (...params: any) => any, ...params: any) {
    callback(...params)
      .catch(Process.printError);
  }

  static async checkIsAuth(
    isAuthorized: () => void, 
    isNotAuthorized: (err: Error) => void = Process.printError
  ) {
    const { isLogged } = await Auth.status();

    if(isLogged) {
      isAuthorized();
    } else {
      isNotAuthorized(new GithubAuthError());
    }
  }
}