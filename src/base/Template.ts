export class Template {
  static all = ["next"] as const;

  static getCapitalizedList() {
    return this.all.map(template => template[0].toUpperCase() + template.slice(1).toLowerCase());
  }

  static getRepositoryTemplateFullname(template: TemplateType | string, isExternal = false) {  
    return isExternal? template:`l-marcel/${template}-start`;
  }

  static isValid(template?: string) {
    return template && this.all.includes(template?.toLowerCase() as TemplateType);
  }
}

export type TemplateType = typeof Template.all[number];