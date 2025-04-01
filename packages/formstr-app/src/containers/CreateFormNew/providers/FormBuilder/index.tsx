import React, { useRef, useState } from "react";
import { AnswerSettings } from "@formstr/sdk/dist/interfaces";
import { FormInitData, IFormBuilderContext } from "./typeDefs";
import { generateQuestion } from "../../utils";
import { getDefaultRelays } from "@formstr/sdk";
import { makeTag } from "../../../../utils/utility";
import { HEADER_MENU_KEYS } from "../../components/Header/config";
import { IFormSettings } from "../../components/FormSettings/types";
import { Tag } from "@formstr/sdk/dist/formstr/nip101";
import { bytesToHex } from "@noble/hashes/utils";
import { getPublicKey } from "nostr-tools";
import { useNavigate } from "react-router-dom";
import { useProfileContext } from "../../../../hooks/useProfileContext";
import { createForm } from "../../../../nostr/createForm";
import {
  getItem,
  LOCAL_STORAGE_KEYS,
  setItem,
} from "../../../../utils/localStorage";
import { Field } from "../../../../nostr/types";

export const FormBuilderContext = React.createContext<IFormBuilderContext>({
  questionsList: [],
  initializeForm: (form: FormInitData) => null,
  saveForm: (onRelayAccepted?: (url: string) => void) => Promise.resolve(),
  editQuestion: (question: Field, tempId: string) => null,
  addQuestion: (primitive?: string, label?: string) => null,
  deleteQuestion: (tempId: string) => null,
  questionIdInFocus: undefined,
  setQuestionIdInFocus: (tempId?: string) => null,
  formSettings: { titleImageUrl: "", formId: "" },
  updateFormSetting: (settings: IFormSettings) => null,
  updateFormTitleImage: (e: React.FormEvent<HTMLInputElement>) => null,
  closeSettingsOnOutsideClick: () => null,
  closeMenuOnOutsideClick: () => null,
  isRightSettingsOpen: false,
  isLeftMenuOpen: false,
  setIsLeftMenuOpen: (open: boolean) => null,
  toggleSettingsWindow: () => null,
  formName: "",
  updateFormName: (name: string) => null,
  updateQuestionsList: (list: Field[]) => null,
  getFormSpec: () => [],
  saveDraft: () => null,
  selectedTab: HEADER_MENU_KEYS.BUILDER,
  setSelectedTab: (tab: string) => "",
  bottomElementRef: null,
  relayList: [],
  setRelayList: (relayList: { url: string; tempId: string }[]) => null,
  editList: null,
  setEditList: (keys: Set<string>) => null,
  viewList: null,
  setViewList: (keys: Set<string>) => null,
});

const InitialFormSettings: IFormSettings = {
  titleImageUrl:
    "https://images.pexels.com/photos/733857/pexels-photo-733857.jpeg",
  description:
    "This is the description, you can use markdown while editing it!" +
    " tap anywhere on the form to edit, including this description.",
  thankYouPage: true,
  formId: makeTag(6),
  encryptForm: true,
  viewKeyInUrl: true,
};

export default function FormBuilderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [questionsList, setQuestionsList] = useState<Array<Field>>([
    generateQuestion(),
  ]);
  const [questionIdInFocus, setQuestionIdInFocus] = useState<
    string | undefined
  >();
  const [formSettings, setFormSettings] =
    useState<IFormSettings>(InitialFormSettings);

  const [isRightSettingsOpen, setIsRightSettingsOpen] = useState(false);
  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(false);
  const [formName, setFormName] = useState<string>(
    "This is the title of your form! Tap to edit."
  );
  const bottomElement = useRef<HTMLDivElement>(null);
  const [relayList, setRelayList] = useState(
    getDefaultRelays().map((relay) => {
      return { url: relay, tempId: makeTag(6) };
    })
  );
  const { pubkey: userPubkey, requestPubkey } = useProfileContext();
  const [editList, setEditList] = useState<Set<string>>(
    new Set(userPubkey ? [userPubkey] : [])
  );
  const [viewList, setViewList] = useState<Set<string>>(new Set([]));
  const [selectedTab, setSelectedTab] = useState<string>(
    HEADER_MENU_KEYS.BUILDER
  );
  const [secretKey, setSecretKey] = useState<string | null>(null);
  const [viewKey, setViewKey] = useState<string | null | undefined>(null);

  const navigate = useNavigate();

  const toggleSettingsWindow = () => {
    setIsRightSettingsOpen((open) => {
      return !open;
    });
  };

  const closeSettingsOnOutsideClick = () => {
    isRightSettingsOpen && toggleSettingsWindow();
  };

  const closeMenuOnOutsideClick = () => {
    isLeftMenuOpen && setIsLeftMenuOpen(false);
  };

  const getFormSpec = (): Tag[] => {
    let formSpec: Tag[] = [];
    formSpec.push(["d", formSettings.formId || ""]);
    formSpec.push(["name", formName]);
    formSpec.push(["settings", JSON.stringify(formSettings)]);
    formSpec = [...formSpec, ...questionsList];
    return formSpec;
  };

  const saveForm = async (onRelayAccepted?: (url: string) => void) => {
    const formToSave = getFormSpec();
    if (!formSettings.formId) {
      alert("Form ID is required");
      return;
    }
    const relayUrls = relayList.map((relay) => relay.url);
    await createForm(
      formToSave,
      relayUrls,
      viewList,
      editList,
      formSettings.encryptForm,
      onRelayAccepted,
      secretKey,
      viewKey
    ).then(
      (artifacts: {
        signingKey: Uint8Array;
        viewKey: Uint8Array;
        acceptedRelays: string[];
      }) => {
        const { signingKey, viewKey, acceptedRelays } = artifacts;
        navigate("/dashboard", {
          state: {
            pubKey: getPublicKey(signingKey),
            formId: formSettings.formId,
            secretKey: bytesToHex(signingKey),
            viewKey: formSettings.viewKeyInUrl ? bytesToHex(viewKey) : null,
            name: formName,
            relay: acceptedRelays[0],
          },
        });
      },
      (error) => {
        console.log("Error creating form", error);
        alert("error creating the form: " + error);
      }
    );
  };

  const saveDraft = () => {
    if (formSettings.formId === "") return;
    type Draft = { formSpec: Tag[]; tempId: string };
    const formSpec = getFormSpec();
    const draftObject = { formSpec, tempId: formSettings.formId! };
    let draftArr = getItem<Draft[]>(LOCAL_STORAGE_KEYS.DRAFT_FORMS) || [];
    const draftIds = draftArr.map((draft: Draft) => draft.tempId);
    if (!draftIds.includes(draftObject.tempId)) {
      draftArr.push(draftObject);
    } else {
      draftArr = draftArr.map((draft: Draft) => {
        if (draftObject.tempId === draft.tempId) {
          return draftObject;
        }
        return draft;
      });
    }
    setItem(LOCAL_STORAGE_KEYS.DRAFT_FORMS, draftArr);
  };

  const editQuestion = (question: Field, tempId: string) => {
    const editedList = questionsList.map((existingQuestion: Field) => {
      if (existingQuestion[1] === tempId) {
        return question;
      }
      return existingQuestion;
    });
    setQuestionsList(editedList);
  };

  const addQuestion = (
    primitive?: string,
    label?: string,
    answerSettings?: AnswerSettings
  ) => {
    setIsLeftMenuOpen(false);
    setQuestionsList([
      ...questionsList,
      generateQuestion(primitive, label, [], answerSettings),
    ]);
    setTimeout(() => {
      bottomElement?.current?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  };

  const deleteQuestion = (tempId: string) => {
    if (questionIdInFocus === tempId) {
      setQuestionIdInFocus(undefined);
    }
    setQuestionsList((preQuestions) => {
      return preQuestions.filter((question) => question[1] !== tempId);
    });
  };

  const updateQuestionsList = (newQuestionsList: Field[]) => {
    setQuestionsList(newQuestionsList);
  };

  const updateFormSetting = (settings: IFormSettings) => {
    setFormSettings((preSettings) => ({ ...preSettings, ...settings }));
  };

  const updateFormTitleImage = (e: React.FormEvent<HTMLInputElement>) => {
    const imageUrl = e.currentTarget.value;
    updateFormSetting({
      titleImageUrl: imageUrl || "",
    });
  };

  const initializeForm = (form: FormInitData) => {
    setFormName(form.spec.filter((f) => f[0] === "name")?.[0]?.[1] || "");
    let settings = JSON.parse(
      form.spec.filter((f) => f[0] === "settings")?.[0]?.[1] || "{}"
    );
    settings = { ...InitialFormSettings, ...settings };
    let fields = form.spec.filter((f) => f[0] === "field") as Field[];
    setFormSettings((settings) => {
      return { ...settings, formId: form.id };
    });
    let viewList = form.spec.filter((f) => f[0] === "allowed").map((t) => t[1]);
    let allKeys = form.spec.filter((f) => f[0] === "p").map((t) => t[1]);
    let editList: string[] = allKeys.filter((p) => !viewList.includes(p));
    setViewList(new Set(viewList));
    setEditList(new Set(editList));
    setFormSettings(settings);
    setQuestionsList(fields);
    setSecretKey(form.secret || null);
    setViewKey(form.viewKey);
  };

  return (
    <FormBuilderContext.Provider
      value={{
        initializeForm,
        questionsList,
        saveForm,
        editQuestion,
        addQuestion,
        deleteQuestion,
        questionIdInFocus,
        setQuestionIdInFocus,
        formSettings,
        updateFormSetting,
        updateFormTitleImage,
        closeSettingsOnOutsideClick,
        closeMenuOnOutsideClick,
        toggleSettingsWindow,
        isRightSettingsOpen,
        isLeftMenuOpen,
        setIsLeftMenuOpen,
        formName,
        updateFormName: setFormName,
        updateQuestionsList,
        getFormSpec,
        saveDraft,
        selectedTab,
        setSelectedTab,
        bottomElementRef: bottomElement,
        relayList,
        setRelayList,
        editList,
        setEditList,
        viewList,
        setViewList,
      }}
    >
      {children}
    </FormBuilderContext.Provider>
  );
}
