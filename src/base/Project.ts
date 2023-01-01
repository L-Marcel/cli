import enquirer from "enquirer";
import kleur from "kleur";
import { CreateProjectOptions } from "..";
import { GithubAuthError } from "../errors/GithubAuthError";
import { GithubError } from "../errors/GithubError";
import { Process } from "./Process";
import { Repository, RepositoryVisibility } from "./services/Repository";
import { Template } from "./Template";
import { Formatter } from "../utils/Formatter";
import { PortfolioConfig } from "./services/PortfolioConfig";

export class Project {
  static async create(
    repositoryName: string, 
    formattedRepositoryName: string,
    {
      addConfig: canAddConfig,
      figma: repositoryFigmaLink,
      docs: repositoryDocsLink,
      self: repositorySelfLink,
      translatedDescription: repositoryTranslatedDescription,
      template: repositoryTemplate,
      public: repositoryIsPublic,
      private: repositoryIsPrivate,
      description: repositoryDescription,
      clone: cloneAfterCreate,
      path: clonePath
    }: CreateProjectOptions) {
    const repository = new Repository();
    const lmarcelConfig = new PortfolioConfig();

    const { 
      repositoriesName: usedRepositoryNames 
    } = await Repository.getAllRepositoriesName()
      .then(names => names)
      .catch(err => {
        if(err === "auth"){
          throw new GithubAuthError();
        } else {
          throw new GithubError();
        }
      });

    //Name - Required
    const nameWasDefined = !!repositoryName && !usedRepositoryNames.includes(repositoryName);
    const { name } = await enquirer.prompt<{
      name: string
    }>({
      type: "input",
      message: "What's the repository name?",
      name: "name",
      skip: nameWasDefined,
      required: true,
      validate: (value) => {
        if(value.length === 0) {
          return "The name should have at least a character!";
        } else if(usedRepositoryNames.includes(value)) {
          return "The name is already in use!";
        }

        return true;
      },
      format: Formatter.replaceSpaces
    });
    repository.name = nameWasDefined? 
      repositoryName.toLowerCase():
      name.toString();

    if(canAddConfig) {
      //FormattedName
      const formattedNameWasDefined = !!formattedRepositoryName;
      const { formattedName } = await enquirer.prompt<{
        formattedName: string
      }>({
        type: "input",
        message: "What's the formatted repository name?",
        name: "formattedName",
        skip: formattedNameWasDefined,
        required: true,
        initial: repository.name
      });
      lmarcelConfig.formmatedName = formattedNameWasDefined? 
        formattedRepositoryName.toLowerCase():
        formattedName.toString();
    }

    //Template - Required
    const templateWasDefined = !!repositoryTemplate;
    const templateIsValid = !!Template.isValid(repositoryTemplate);
    const validTemplateWasDefined = templateWasDefined && templateIsValid;

    const { wantsToUseExternalTemplate } = await enquirer.prompt<{
      wantsToUseExternalTemplate: boolean
    }>({
      type: "confirm",
      message: "Would you like to use a external template?",
      name: "wantsToUseExternalTemplate",
      skip: validTemplateWasDefined,
      initial: false,
    });

    if(!wantsToUseExternalTemplate && !templateIsValid) {
      const { template } = await enquirer.prompt<{
        template: string
      }>({
        type: "select",
        message: "What's the template that you will use?",
        choices: Template.getCapitalizedList(),
        name: "template"
      });

      repositoryTemplate = template;
    } else if(wantsToUseExternalTemplate && !templateWasDefined) {
      const { template } = await enquirer.prompt<{
        template: string
      }>({
        type: "input",
        message: "What's the template that you will use?",
        name: "template",
        format: Formatter.replaceSpaces,
        required: true
      });

      repositoryTemplate = template;
    }

    repositoryTemplate = repositoryTemplate?.toLowerCase();
    repository.template = {
      name: repositoryTemplate ?? "next",
      isExernal: wantsToUseExternalTemplate
    };

    //Description
    const descriptionWasDefined = !!repositoryDescription;
    const { description } = await enquirer.prompt<{
      description: string
    }>({
      type: "input",
      message: "What's the repository description?",
      name: "description",
      skip: descriptionWasDefined
    });
    repository.description = descriptionWasDefined?
      repositoryDescription:description;

    //Translated description
    if(canAddConfig) {
      const translatedDescriptionWasDefined = !!repositoryTranslatedDescription;
      const { translatedDescription } = await enquirer.prompt<{
      translatedDescription: string
    }>({
      type: "input",
      message: "What's the repository translated description?",
      name: "translatedDescription",
      skip: translatedDescriptionWasDefined
    });
      lmarcelConfig.translatedDescription = translatedDescriptionWasDefined?
        repositoryTranslatedDescription:translatedDescription;
    }

    //Visibility - Required
    const visibilityIsNotDefined = repositoryIsPublic === repositoryIsPrivate;
    const { wantsToCreateAPublicRepository } = await enquirer.prompt<{
      wantsToCreateAPublicRepository: boolean
    }>({
      type: "confirm",
      message: "Is a public repository?",
      name: "wantsToCreateAPublicRepository",
      skip: !visibilityIsNotDefined,
      initial: !repositoryIsPublic,
      required: true
    });
    
    const repositoryVisibility: RepositoryVisibility = 
      wantsToCreateAPublicRepository? "public":"private";
    repository.visibility = repositoryVisibility;

    if(canAddConfig) {
      //Pinned
      const { wantsToPinThisRepository } = await enquirer.prompt<{
        wantsToPinThisRepository: boolean
      }>({
        type: "confirm",
        message: "Want to pin this repository?",
        name: "wantsToPinThisRepository",
        skip: validTemplateWasDefined,
        initial: false,
      });

      lmarcelConfig.isPinned = wantsToPinThisRepository;

      //Self
      const selfLinkWasDefined = !!repositorySelfLink;
      const { selfLink } = await enquirer.prompt<{
        selfLink: string
      }>({
        type: "input",
        message: "Enter the repository homepage if it exists:",
        name: "selfLink",
        skip: descriptionWasDefined
      });
      lmarcelConfig.selfLink = selfLinkWasDefined?
        repositorySelfLink:selfLink;

      //Figma
      const figmaLinkWasDefined = !!repositoryFigmaLink;
      const { figmaLink } = await enquirer.prompt<{
        figmaLink: string
      }>({
        type: "input",
        message: "Enter the project link in figma if it exists:",
        name: "figmaLink",
        skip: descriptionWasDefined
      });
      lmarcelConfig.figmaLink = figmaLinkWasDefined?
        repositoryFigmaLink:figmaLink;

      //Documentation
      const docsLinkWasDefined = !!repositoryDocsLink;
      const { docsLink } = await enquirer.prompt<{
        docsLink: string
      }>({
        type: "input",
        message: "Enter the app documentation link if it exists:",
        name: "docsLink",
        skip: descriptionWasDefined
      });
      lmarcelConfig.docsLink = docsLinkWasDefined?
        repositoryDocsLink:docsLink;
    }

    //Creating
    Process.info(`Creating ${kleur.yellow(repository.name)} repository with ${
      kleur.yellow(repository.template.name)
    }${
      repository.template.isExernal? " external":""
    } template...`);

    await repository.create();
    Process.success(`Repository ${kleur.green(repository.name)} was created...`);
  
    //Cloning
    if(cloneAfterCreate || canAddConfig) {
      await Repository.clone(repository.name, clonePath);
    }

    return true;
  }
}