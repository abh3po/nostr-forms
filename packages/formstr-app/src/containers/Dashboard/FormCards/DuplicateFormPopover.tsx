import React, { useState } from "react";
import { Popover } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { makeTag } from "../../../utils/utility";
import { constructDraftUrl } from "./Drafts";
import { Tag } from "@formstr/sdk/dist/formstr/nip101";

type Props = {
  tags: Tag[];
};

const DuplicateFormPopover: React.FC<Props> = ({ tags }) => {
  const [open, setOpen] = useState(false);
  const handleOpenChange = (newOpen: boolean) => setOpen(newOpen);
  const hide = () => setOpen(false);

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
    hide();
  };

  const handleStructureDuplicate = () => {
    const formFields = tags.filter((tag) => tag[0] === "field");
    const nameTag = tags.find((tag) => tag[0] === "name");
    const settingsTag = tags.find((tag) => tag[0] === "settings");

    const cleanedFields = formFields.map((tag) => {
      return [tag[0], tag[1], tag[2], "Untitled Question", "[]", tag[5]];
    });

    const newFormId = makeTag(6);
    const duplicatedTags: Tag[] = [
      ["d", newFormId],
      ["name", nameTag?.[1] || "Untitled Form"],
      [
        "settings",
        (() => {
          let settingsObj = {};
          try {
            settingsObj = JSON.parse(settingsTag?.[1] || "{}");
          } catch {}
          return JSON.stringify({ ...settingsObj, formId: newFormId });
        })(),
      ],
      ...cleanedFields,
    ];
    saveAndOpen(duplicatedTags, newFormId);
    hide();
  };

  return (
    <Popover
      content={
        <>
          <div>
            <a onClick={handleFullDuplicate}>Full Duplicate</a>
          </div>
          <div>
            <a onClick={handleStructureDuplicate}>Structure Only</a>
          </div>
          <div>
            <a onClick={hide}>Close</a>
          </div>
        </>
      }
      title="Duplicate Form"
      trigger="click"
      open={open}
      onOpenChange={handleOpenChange}
    >
      <CopyOutlined
        style={{ color: "blue", marginBottom: 3, cursor: "pointer" }}
      />
    </Popover>
  );
};

export default DuplicateFormPopover;
