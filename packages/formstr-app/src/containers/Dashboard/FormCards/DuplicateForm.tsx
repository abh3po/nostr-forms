import React, { useState } from "react";
import { CopyOutlined } from "@ant-design/icons";
import { isMobile, makeTag } from "../../../utils/utility";
import { constructDraftUrl } from "./Drafts";
import { Tag } from "@formstr/sdk/dist/formstr/nip101";
import { Tooltip } from "antd";

type Props = {
  tags: Tag[];
};

const DuplicateForm: React.FC<Props> = ({ tags }) => {
  const saveAndOpen = (duplicatedTags: Tag[], newFormId: string) => {
    const duplicatedForm = {
      formSpec: duplicatedTags,
      tempId: newFormId,
    };

    const existingDrafts = localStorage.getItem("formstr:draftForms");
    let updatedDrafts = existingDrafts ? JSON.parse(existingDrafts) : [];

    updatedDrafts = [duplicatedForm, ...updatedDrafts];

    localStorage.setItem("formstr:draftForms", JSON.stringify(updatedDrafts));

    window.open(
      constructDraftUrl(duplicatedForm, window.location.origin),
      "_blank"
    );
  };

  const handleFullDuplicate = () => {
    const newFormId = makeTag(6);
    const duplicatedTags = tags.map((tag) => {
      if (tag[0] === "d") return ["d", newFormId];
      if (tag[0] === "settings") {
        try {
          const settings = JSON.parse(tag[1]);
          return [
            "settings",
            JSON.stringify({ ...settings, formId: newFormId }),
          ];
        } catch {
          return tag;
        }
      }
      return [...tag];
    });
    saveAndOpen(duplicatedTags, newFormId);
  };

  return (
    <Tooltip title={"Duplicate Form"} trigger={isMobile() ? "click" : "hover"}>
      <CopyOutlined
        style={{
          color: "purple",
          borderColor: "purple",
          marginBottom: 3,
          cursor: "pointer",
        }}
        onClick={handleFullDuplicate}
      />
    </Tooltip>
  );
};

export default DuplicateForm;
