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

export interface StoredForm {
  id?: number;
  slug: string;
  pubkey: string;
  identifier: string;
  relays: string[]; // Stored as JSON in DB
  owner: string;
  viewKey?: string | null; // NEW FIELD
  expirationDate: string;
}
