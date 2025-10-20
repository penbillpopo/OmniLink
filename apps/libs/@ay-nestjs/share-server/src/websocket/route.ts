export type WebSocketRoute = {
  path: string;
  controller: any;
  method: string;
  rules: Rule[];
  identifier: string;
};

export type Rule = {
  name: string;
  required: boolean;
  type?: string;
  initializer?: any;
  decorators?: string[];
};
