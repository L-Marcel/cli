import { spawn } from "child_process";
import { CreateProjectParams } from "./Project";
import { Template } from "./Template";

export type RepositoryVisibility = "public" | "private";

export class Repository {
  static async create({ name, template, visibility, description  }: CreateProjectParams) {
    return new Promise<boolean>((resolve, reject) => {
      let res = spawn(`gh repo create ${name} --template ${Template.getRepositoryTemplateFullname(template)} --description "${description}" --${visibility}`, {
        shell: true,
      });

      res.stderr?.on('data', (data) => {
        reject(data.toString().match(/gh auth login/g)? "auth":"error");
      });

      res.on("exit", (code) => {
        resolve(code === 0? true:false);
      })
    });
  };

  static async clone(name: string, dir?: string) {
    return new Promise<boolean>((resolve, reject) => {
      let res = spawn(`gh repo clone ${name} ${dir ?? name}`, {
        shell: true,
      });

      res.stderr?.on('data', (data) => {
        const response = data.toString();

        if(!response.match(/Cloning into/g)) {
          reject(data.toString().match(/(gh auth login)|(denied)/g)? "auth":"error");
        };
      });

      res.on("exit", (code) => {
        resolve(code === 0? true:false);
      })
    });
  };

  static async getAllRepositoriesName() {
    return new Promise<string[]>((resolve, reject) => {
      let res = spawn("gh repo list --json name --limit 9999999999999", {
        shell: true,
      });
  
      res.stdout?.on('data', (data) => {
        resolve(JSON.parse(data).map((repository: {
          name: string
        }) => repository.name.toLowerCase()));
      });

      res.stderr?.on('data', (data) => {
        reject(data.toString().match(/gh auth login/g)? "auth":"error");
      });
    })
  };
}