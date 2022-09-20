import { spawn } from "child_process";
import { program } from "commander";
import enquirer from "enquirer";
import { Process } from "./base/Process";
import { Project } from "./base/Project";
import { Repository } from "./base/Repository";
import { TemplateType } from "./base/Template";

export type Args = string[];
export type PromptOptions = Parameters<typeof enquirer.prompt>[0];

export type CreateProjectOptions = {
  public: boolean;
  private: boolean;
  template?: TemplateType;
  addConfig: boolean;
  clone: boolean;
  description: string;
  path?: string;
};

program
  .name('lm, l-marcel')
  .description('My CLI')
  .version('0.0.1');

program
  .command("login")
  .description("login with github, it's required")
  .action(() => {
    Process.info("Starting github auth...");
    spawn("gh auth login", {
      shell: true,
      stdio: [0, 1, 2],
    });
  })

program
  .command("create")
  .description("create a new project and clone the repository")
  .argument("[name]", "name of the new project folder", "")
  .option("-pr, --private", "set private visibility", false)
  .option("-pb, --public", "set public visibility", false)
  .option("-t, --template [template]", "used template: next, react, express or node")
  .option("-d, --description [string]", "repository description", "")
  .option("--no-clone", "just craate the repository", true)
  .option("--path [path]", "clone directory")
  .option("-c, --add-config", "add l-marcel.config.json file", false)
  .action((arg: string, options: CreateProjectOptions) => {
    Process.run(Project.create, arg, options);
  });

program
  .command("clone")
  .argument("[name]", "repository name", "")
  .argument("[path]", "clone directory")
  .description("clone a github repository")
  .action((name: string, path?: string) => {
    Process.run(Repository.clone, name, path);
  });

program.parse();