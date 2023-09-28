import { useState } from "react";
import { createForm } from "../../utils/nostr";
import Constants from "../../constants";
import { Button, Card, Form, Input } from "antd";
import FormSubmitted from "./FormSubmitted";
import FormSettings from "./FormSettings";
import QuestionForm from "./QuestionForm";

function NewForm() {
  const [questions, setQuestions] = useState([]);
  const [formCredentials, setFormCredentials] = useState("");
  const [activeTab, setActiveTab] = useState(
    Constants.CreateFormTab.addQuestion
  );
  const [settingsForm] = Form.useForm();
  const [questionsForm] = Form.useForm();

  function handleNameChange(event) {
    settingsForm.setFieldValue("name", event.target.value);
  }

  const tabList = [
    {
      key: Constants.CreateFormTab.addQuestion,
      label: "Add Questions",
    },
    {
      key: Constants.CreateFormTab.settings,
      label: "Settings",
    },
  ];

  function handleTabChange(key) {
    setActiveTab(key);
  }

  function handleAddQuestion(question) {
    let newQuestions = [...questions, question];
    setQuestions(newQuestions);
  }

  function submitSettingsForm() {
    settingsForm.onFinish = handleSaveForm;
    settingsForm.submit();
    settingsForm.onFinish();
  }

  async function handleSaveForm(values) {
    let showOnGlobal =
      settingsForm.getFieldValue("showOnGlobal") ?? true;
    let formspec = {
      name: settingsForm.getFieldValue("name"),
      description: settingsForm.getFieldValue("description"),
      settings: { selfSignForms: settingsForm.getFieldValue("selfSign") },
      fields: questions,
    };
    const [pk, sk] = await createForm(formspec, showOnGlobal);
    setFormCredentials({ publicKey: pk, privateKey: sk });
  }

  function onFinishFailed(error) {
    console.log("Task failed successfully :D", error);
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          alignContent: "center",
          alignItems: "center",
          maxWidth: "100%",
        }}
      >
        {!formCredentials && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignContent: "left",
              justifyContent: "left",
              maxWidth: "100%",
              minWidth: "70%",
            }}
          >
            <Card
              style={{ maxWidth: "100%", alignContent: "left" }}
              tabList={tabList}
              activeTabKey={activeTab}
              onTabChange={handleTabChange}
              title={settingsForm.getFieldValue("name") || "New Form"}
              extra={
                <Button
                  type="primary"
                  disabled={questions.length < 1}
                  onClick={submitSettingsForm}
                >
                  Submit Form
                </Button>
              }
            >
              {activeTab === Constants.CreateFormTab.settings && (
                <>
                  <FormSettings
                    onFormFinish={handleSaveForm}
                    form={settingsForm}
                    onFinishFailed={onFinishFailed}
                  />
                </>
              )}

              {activeTab === Constants.CreateFormTab.addQuestion && (
                <>
                  <Card style={{ margin: "10px" }}>
                    <div
                      style={{
                        justifyContent: "left",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        margin: "10px",
                      }}
                    >
                      <Form form={settingsForm}>
                        {" "}
                        <Form.Item
                          name="name"
                          label="Name of the form"
                          rules={[{ required: true }]}
                        >
                          <Input onChange={handleNameChange} />
                        </Form.Item>
                      </Form>
                      <Button
                        type="link"
                        onClick={() => {
                          handleTabChange(Constants.CreateFormTab.settings);
                        }}
                      >
                        Additional Settings
                      </Button>
                    </div>
                  </Card>
                  <QuestionForm
                    form={questionsForm}
                    questions={questions}
                    onAddQuestion={handleAddQuestion}
                  />

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      margin: "10px",
                    }}
                  >
                    {questions.length >= 1 && (
                      <Button type="primary" onClick={submitSettingsForm}>
                        Finish
                      </Button>
                    )}
                  </div>
                </>
              )}
            </Card>
          </div>
        )}
      </div>
      {formCredentials && (
        <FormSubmitted
          formCredentials={formCredentials}
          formName={settingsForm.getFieldValue("name")}
        />
      )}
    </>
  );
}

export default NewForm;
