import { Files } from "../Files";

export class PortfolioConfig {
  public translatedDescription?: string; 
  public selfLink?: string;
  public figmaLink?: string;
  public docsLink?: string;
  public formmatedName = "";
  public isPinned = false;
  
  async put(dir = "") {
    //const lmarcelConfigFileExist = Files.exist();
  }
}