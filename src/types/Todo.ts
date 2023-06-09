export default interface Todo {
  id: string;
  name: string;
  completed: boolean;

  text?: string;
  children?: Todo[];
  parent?: string;
}
