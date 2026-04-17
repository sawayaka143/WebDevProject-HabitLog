import { Task } from "../services/ide-state.service";

export interface StructLine {
  lineNo: number;
  type: 'comment' | 'typedef' | 'field' | 'brace' | 'blank';
  raw?: string;
  field?: string;
  value?: string;
  comment?: string;
  editable?: boolean;
  fieldKey?: keyof Task;
}

