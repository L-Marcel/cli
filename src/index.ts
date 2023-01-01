#!/usr/bin/env node

import { program } from "commander";
import enquirer from "enquirer";
import { Process } from "./base/Process";
import { Project } from "./base/Project";
import { Repository } from "./base/services/Repository";
import { TemplateType } from "./base/Template";
import { Auth, AuthLoginParams } from "./base/services/Auth";

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
  .name("lm, l-marcel")
  .description("L-Marcel CLI")
  .version("1.0.4");

program
  .command("login")
  .description("login with github, it's required")
  .option("-f, --fast", "fast mode", true)
  .option("-h, --hostname [string]", "the hostname of the github instance")
  .option("-g, --git", "authenticate git with your github credentials", true)
  .option("--ssh", "set ssh git protocol", false)
  .action((options: AuthLoginParams) => {
    Process.run(Auth.login, options);
  });

program
  .command("logout")
  .description("logged out of github account")
  .argument("[hostname]", "account username or hostname")
  .action((hostname: string) => {
    Process.run(Auth.logout, hostname);
  });

program
  .command("status")
  .description("check your authentication state")
  .argument("[hostname]", "account username or hostname")
  .action(() => {
    Process.run(Auth.status, true);
  });

program
  .command("create")
  .description("create a new project and clone the repository")
  .argument("[name]", "name of the new project folder", "")
  .option("-pr, --private", "set private visibility", false)
  .option("-pb, --public", "set public visibility", false)
  .option("-t, --template <string>", "used template: next")
  .option("-d, --description [string]", "repository description", "")
  .option("--no-clone", "just craate the repository", true)
  .option("-v, --version [string]", "set version", "0.0.1")
  .option("-p, --path <string>", "clone directory")
  .option("-l, --license <string>", "repository license")
  .option("-c, --add-config", "add l-marcel.config.json file", false)
  .option("-h, --homapage <url>", "repository homapage")
  //topics
  .option("-ctd, --add-translated-description <description>", "translated l-marcel.config.json description", true)
  .action((arg: string, options: CreateProjectOptions) => {
    Process.checkIsAuth(() => {
      Process.run(Project.create, arg, options);
    });
  });

program
  .command("clone")
  .description("clone a github repository")
  .argument("<name>", "repository name")
  .argument("[path]", "clone directory")
  .action((name: string, path?: string) => {
    Process.checkIsAuth(() => {
      Process.run(Repository.clone, name, path);
    });
  });

program
  .command("push")
  .description("create a commit and push ALL changes")
  .argument("<message>", "commit message")
  .argument("[dir]", "directory to commit", ".")
  .action((message: string, dir?: string) => {
    Process.checkIsAuth(() => {
      Process.run(Repository.commit, message, dir);
    });
  });

program.parse();