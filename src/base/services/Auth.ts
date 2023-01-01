import { Process } from "../Process";
import { spawn } from "child_process";
import cp from "copy-paste";
import kleur from "kleur";
import open from "open";
import { GithubAuthError } from "../../errors/GithubAuthError";

export interface AuthStatus {
  exitCode: boolean;
  isLogged: boolean;
  hostnames: string[];
}

export interface AuthLoginParams {
  ssh: boolean;
  hostname?: string;
  fast: boolean;
  git: boolean;
}

export class Auth {
  static login({ ssh, hostname, git, fast }: AuthLoginParams) {
    return new Promise<boolean>((resolve) => {
      Process.info("Starting github auth...");
       
      const child = spawn("gh", [
        "auth" ,
        "login",
        ...(hostname? ["--hostname", `${hostname}`]:[]),
        "--git-protocol",
        `${ssh? "shh":"https"}`,
        "-w"
      ], {
        shell: true,
        stdio: ["pipe", "pipe", "pipe"]
      });

      process.stdin.pipe(child.stdin);

      child.stderr.on("data", (data) => {
        const response = data.toString();

        if(
          /First copy your one-time code: /g.test(response) 
          && /Open this URL to continue in your web browser: /g.test(response)
        ) {
          const message = response.split("First copy your one-time code: ")[1];
          let [code, url] = message.split("Open this URL to continue in your web browser: ");
          
          code = code.trim();
          url = url.trim();
          
          if(fast) {
            cp.copy(code, () => {
              Process.info(`Code copied: ${kleur.yellow(code)}`);
              Process.info(`Opening auth page in 5 seconds: ${kleur.yellow(url)}`);

              setTimeout(() => {
                open(url, {
                  newInstance: true,
                });
              }, 5000);
            });
          } else {
            Process.info(`Copy this code: ${kleur.yellow(code)}`);
            Process.info(`Authenticate in this page: ${kleur.yellow(url)}`);
          }
        } else if(/Logged in as /.test(response)) {
          const account = response.split("Logged in as ")[1].trim();
          Process.success(`Logged in as ${kleur.green(account)}`);
        }
      });

      setTimeout(() => {
        child.stdin?.write(`${git? "Y":"n"}\r\n`);
        setTimeout(() => {
          child.stdin?.write("\r\n");
        }, 3000);
      }, 3000);

      child.on("exit", (code) => {
        resolve(code === 0? true:false);
      });
    });
  }

  static async logout(hostname?: string) {
    const hostnameIsNotDefined = !hostname;
    const { hostnames } = await Auth.status();

    if(hostnameIsNotDefined && hostnames.length >= 1) {
      const [currentHostname] = hostnames[0].split(" | ");
      hostname = currentHostname;
    } else if(hostnameIsNotDefined) {
      hostname = "github.com";
    }

    return new Promise<boolean>((resolve) => {
      const child = spawn("gh", [
        "auth",
        "logout",
        "-h",
        hostname as string
      ], {
        shell: true,
        stdio: ["pipe", "pipe", "pipe"]
      });

      child.stderr.on("data", (data) => {
        const response = data.toString();

        if(/not logged in to any hosts/g.test(response)) {
          Process.info(`Not logged in to any ${kleur.yellow("hosts")}`);
        } else if(/not logged into/g.test(response)) {
          Process.info(`Not logged into ${kleur.yellow(hostname as string)}`);
        }
      });

      child.on("exit", (code) => {
        if(code === 0) {
          const loggedOutHostnameInfo = hostnames.map(loggedHostnames => {
            return loggedHostnames.split(" | ");
          }).find(([loggedHostname]) => loggedHostname === hostname);


          if(loggedOutHostnameInfo) {
            const [loggedOutHostname, loggedOutAccount] = loggedOutHostnameInfo;
            Process.success(`Logged out of ${kleur.green(loggedOutHostname)} account ${kleur.green(loggedOutAccount)}`);
          }
        }

        resolve(code === 0? true:false);
      });
    });
  }

  static status(withLogs = false) {
    return new Promise<AuthStatus>((resolve) => {
      let isLogged = false;
      const hostnames: string[] = [];

      const child = spawn("gh",
        [
          "auth", 
          "status",
          "--show-token"
        ], {
          shell: true
        });

      child.stderr.on("data", (data) => {
        const response = data.toString();
        
        if(/You are not logged into any GitHub hosts/g.test(response) && withLogs) {
          Process.info(`Not logged in to any ${kleur.yellow("hosts")}`);
        } else if(/Logged in to /g.test(response) && / as /g.test(response)) {
          const messages = response.split("Logged in to ");
          const countOfMessages = messages.length - 1;

          for(let i = 0; i < countOfMessages; i++) {
            isLogged = true;
            const loggedMessage = messages[i+1];
            const [hostname, accountMessage] = loggedMessage.split(" as ");
            const [account, authType] = accountMessage.split(" ");

            const haveOAuthToken = /oauth_token/g.test(authType);
            let token = "";
            
            if(haveOAuthToken && /Token: /g.test(accountMessage)) {
              const [,oAuthTokenMessage] = accountMessage.split("Token: ");
              const [oAuthToken] = oAuthTokenMessage.split("\n");
              token = oAuthToken;
            }
            
            hostnames.push(`${hostname} | ${account}${haveOAuthToken? ` | ${token}`:""}`);

            if(withLogs) {
              Process.success(`Logged in to ${kleur.green(hostname)} as ${kleur.green(account)} ${haveOAuthToken? `(${kleur.yellow("oauth_token")})`:""}`);
            }
          }
        }
      });

      child.on("exit", (code) => {
        resolve({
          exitCode: code === 0? true:false,
          isLogged,
          hostnames
        });
      });
    });
  }

  static async getOAuthToken() {
    const { hostnames, isLogged } = await Auth.status();

    if(isLogged) {
      const [,,token] = hostnames[0].split(" | ");
      return token;
    }

    throw new GithubAuthError();
  }
}