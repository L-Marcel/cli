import { spawn } from "child_process";
import { Template } from "../Template";
import { Process } from "../Process";
import { GithubAuthError } from "../../errors/GithubAuthError";
import kleur from "kleur";
import { GithubRepositoryNotFound } from "../../errors/GithubRepositoryNotFound";
import { RepositoryCommitError } from "../../errors/RepositoryCommitError";

export type RepositoryVisibility = "public" | "private";

export interface RepositoriesNameResponse {
  exitCode: boolean;
  repositoriesName: string[];
}

export interface RepositoryCommitResponse {
  exitCode: boolean;
}

export class Repository {
  public name = "";
  public template = {
    name: "next",
    isExernal: false
  };
  public description?: string;
  public visibility: RepositoryVisibility = "public";

  async create() {
    return new Promise<boolean>((resolve, reject) => {
      const child = spawn("gh", 
        [
          "repo", "create", this.name, 
          "--template", Template.getRepositoryTemplateFullname(
            this.template.name, 
            this.template.isExernal
          ), 
          ...(this.description? ["--description", `"${this.description}"`]:[]),
          `--${this.visibility}`
        ], {
          shell: true,
        });

      child.stderr.on("data", (data) => {
        reject(/gh auth login/g.test(data.toString())? "auth":"error");
      });



      child.on("exit", (code) => {
        resolve(code === 0? true:false);
      });
    });
  }

  static async clone(name: string, dir?: string) {
    const targetDir = dir ?? name;

    return new Promise<boolean>((resolve, reject) => {
      const child = spawn("gh", [
        "repo", "clone", name, targetDir
      ], {
        shell: true,
      });

      child.stderr.on("data", (data) => {
        const response = data.toString();

        if(/Could not resolve to a Repository/g.test(response) && /'/g.test(response)) {
          const [,repositoryName] = response.split("'");
          reject(new GithubRepositoryNotFound(repositoryName));
        } else if(/Cloning into/g.test(response)) {
          Process.info(`Cloning into ${kleur.yellow(targetDir)}...`);
        } else {
          reject(/(gh auth login)|(denied)/g.test(data.toString())? new GithubAuthError():"error");
        }
      });

      child.on("exit", (code) => {
        if(code === 0) {
          Process.success(`Repository ${kleur.green(name)} was cloned into ${kleur.green(targetDir)}`);
        }

        resolve(code === 0? true:false);
      });
    });
  }

  static async getAllRepositoriesName() {
    return new Promise<RepositoriesNameResponse>((resolve, reject) => {
      let repositoriesName: string[] = [];

      const child = spawn("gh", [
        "repo", "list", "--json name", "--limit", "9999999999999"
      ], {
        shell: true,
      });
  
      child.stdout.on("data", (data) => {
        repositoriesName = JSON.parse(data).map((repository: {
          name: string
        }) => repository.name.toLowerCase());
      });

      child.stderr.on("data", (data) => {
        reject(/gh auth login/g.test(data.toString())? "auth":"error");
      });

      child.on("exit", (code) => {
        resolve({
          exitCode: code === 0? true:false,
          repositoriesName
        });
      });
    });
  }

  static async commit(message: string, dir = ".") {
    return new Promise<boolean>((resolve, reject) => {
      const child = spawn(`cd ${dir} && git add . && git commit -m "${message}" && git push`, {
        shell: true,
      });

      child.on("exit", (code) => {
        if(code === 0) {
          const isRootDir = dir === ".";

          Process.success(`Commit ${kleur.green(`"${message}"`)} pushed ${isRootDir? "":`in ${kleur.green(dir)}`}`);
          resolve(true);
        } else {
          reject(new RepositoryCommitError());
        }
      });
    });
  }
}