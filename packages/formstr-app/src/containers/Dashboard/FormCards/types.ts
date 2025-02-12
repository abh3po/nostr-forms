export type IDeleteFormsTrigger = IDeleteFormsLocal;

export interface IDeleteFormsLocal {
  formKey: string;
  onDeleted: () => void;
  onCancel: () => void;
  style?: Record<string, string | number>;
}

export interface IDeleteFormsNostr {
  key: string;
  onDeleted: () => void;
  onCancel: () => void;
}
