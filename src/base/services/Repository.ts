import { spawn } from "child_process";
import { CreateProjectParams } from "../Project";
import { Template } from "../Template";
import { Process } from "../Process";
import { GithubAuthError } from "../../errors/GithubAuthError";
import kleur from "kleur";

export type RepositoryVisibility = "public" | "private";

export interface RepositoriesNameResponse {
  exitCode: boolean;
  repositoriesName: string[];
}

export class Repository {
  static async create({ name, template, visibility, description  }: CreateProjectParams) {
    return new Promise<boolean>((resolve, reject) => {
      const child = spawn(`gh repo create ${name} --template ${Template.getRepositoryTemplateFullname(template)} --description "${description}" --${visibility}`, {
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
      const child = spawn(`gh repo clone ${name} ${targetDir}`, {
        shell: true,
      });

      child.stderr.on("data", (data) => {
        const response = data.toString();

        if(!/Cloning into/g.test(response)) {
          reject(/(gh auth login)|(denied)/g.test(data.toString())? new GithubAuthError():"error");
        } else if(/Cloning into/g.test(response)) {
          Process.info(`Cloning into ${kleur.yellow(targetDir)}...`);
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

      const child = spawn("gh repo list --json name --limit 9999999999999", {
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
}