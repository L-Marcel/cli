import enquirer from "enquirer";
import kleur from "kleur";
import { CreateProjectOptions, PromptOptions } from "..";
import { GithubAuthError } from "../errors/GithubAuthError";
import { GithubError } from "../errors/GithubError";
import { InvalidTemplateError } from "../errors/InvalidTemplateError";
import { Process } from "./Process";
import { Repository, RepositoryVisibility } from "./Repository";
import { Template, TemplateType } from "./Template";

export interface CreateProjectParams {
  visibility: RepositoryVisibility;
  template: TemplateType;
  name: string;
  description: string;
};


export class Project {
  static async create(arg: string, options: CreateProjectOptions) {
    const questions: PromptOptions = [];
  
    const usedRepositoryNames = await Repository.getAllRepositoriesName()
      .then(names => names)
      .catch(err => {
        if(err === "auth"){
          throw new GithubAuthError();
        } else {
          throw new GithubError();
        };
      });
  
    if(!arg || usedRepositoryNames.includes(arg)) {
      questions.push({
        type: "input",
        message: "What's the repository or project name?",
        choices: Template.getCapitalizedList(),
        name: "name",
        required: true,
        validate: (value) => {
          if(value.length === 0) {
            return "The name should have at least a character!";
          } else if(usedRepositoryNames.includes(value)) {
            return "The name is already in use!";
          };
  
          return true;
        },
        format: (value) => {
          return value.replace(/ /g, "-");
        }
      });
    };
  
    let description = options.description;
    if(!description) {
      questions.push({
        type: "input",
        message: "What's the repository or project description?",
        choices: Template.getCapitalizedList(),
        name: "description"
      });
    };

    const templateIsInvalid = !Template.isValid(options.template);
    if(templateIsInvalid) {
      questions.push({
        type: "select",
        message: "What's the template that you will use?",
        choices: Template.getCapitalizedList(),
        name: "template"
      });
    };
  
    let visibility: RepositoryVisibility = "public";
    const visibilityIsNotDefined = options.public === options.private;
    if(visibilityIsNotDefined) {
      questions.push({
        type: "confirm",
        message: "Is a public repository?",
        name: "visibility",
        initial: true,
      });
    } else if(options.private) {
      visibility = "private";
    };
  
    const answers = await enquirer.prompt<Partial<CreateProjectParams>>(questions);
  
    const template = (templateIsInvalid? 
      answers.template?.toLowerCase():
      options.template?.toLowerCase()
    ) as TemplateType;
  
    if(!Template.isValid(template)) {
      throw new InvalidTemplateError();
    };
  
    if(!answers.visibility && visibilityIsNotDefined) {
      visibility = "private";
    };
  
    const params: CreateProjectParams = {
      description,
      name: arg,
      ...answers,
      visibility,
      template,
    };

    Process.info(`Creating ${kleur.yellow(params.name)} repository with ${kleur.yellow(params.template)} template...`);
    await Repository.create(params);
    Process.success(`Repository ${kleur.green(params.name)} was created...`);
  
    if(options.clone) {
      await Repository.clone(params.name, options.path);
      Process.success(`Repository ${kleur.green(params.name)} was cloned...`);
    };

    return true;
  };
};