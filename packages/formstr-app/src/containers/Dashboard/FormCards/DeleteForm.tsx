import { DeleteOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd";
import { useState } from "react";
import { ILocalForm } from "../../CreateFormNew/providers/FormBuilder/typeDefs";
import {
  getItem,
  LOCAL_STORAGE_KEYS,
  setItem,
} from "../../../utils/localStorage";
import { IDeleteFormsLocal, IDeleteFormsTrigger } from "./types";

function DeleteConfirmationLocal({
  formKey,
  onCancel,
  onDeleted,
}: IDeleteFormsLocal) {
  const onDeleteForm = () => {
    let localForms =
      getItem<ILocalForm[]>(LOCAL_STORAGE_KEYS.LOCAL_FORMS) ?? [];
    localForms = localForms.filter((v: ILocalForm) => v.key !== formKey);
    setItem(LOCAL_STORAGE_KEYS.LOCAL_FORMS, localForms);
    onDeleted();
  };
  return (
    <Modal
      title={"Are you sure you want to delete this form from your device?"}
      open
      onOk={onDeleteForm}
      onCancel={onCancel}
    >
      <p>This action is irreversible</p>
    </Modal>
  );
}

function DeleteFormTrigger({
  formKey,
  onDeleted,
}: Optional<IDeleteFormsTrigger, "onDeleted" | "onCancel">) {
  const [deleteConfirmationOpen, updateDeleteConfirmationOpen] =
    useState(false);
  const onDelete = () => {
    updateDeleteConfirmationOpen(false);
    if (onDeleted) onDeleted();
  };
  const onCancel = () => {
    updateDeleteConfirmationOpen(false);
  };
  return (
    <>
      <Button
        type={"text"}
        onClick={(e) => {
          updateDeleteConfirmationOpen(true);
        }}
        style={{ color: "red" }}
      >
        <DeleteOutlined />
      </Button>
      {deleteConfirmationOpen && (
        <DeleteConfirmationLocal
          formKey={formKey}
          onDeleted={onDelete}
          onCancel={onCancel}
        />
      )}
    </>
  );
}

export default DeleteFormTrigger;