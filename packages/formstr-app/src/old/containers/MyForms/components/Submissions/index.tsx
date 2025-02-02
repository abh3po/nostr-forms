import { Table } from "antd";
import EmptyScreen from "../../../../../components/EmptyScreen";
import { LOCAL_STORAGE_KEYS, getItem } from "../../../../../utils/localStorage";
import { makeTag, isMobile } from "../../../../../utils/utility";

import { ISubmission, ISubmissionTable } from "./submissions.types";
import { ROUTES } from "../../../../../constants/routes";
import { useEffect, useState } from "react";
import { fetchProfiles } from "@formstr/sdk";
import { useNavigate } from "react-router-dom";

const COLUMNS = [
  {
    key: "formName",
    title: "Form Name",
    dataIndex: "formName",
    width: 25,
    ellipsis: true,
  },
  {
    key: "submitted At",
    title: "Submitted on",
    dataIndex: "submittedAt",
    width: 15,
    render: (submittedAt: string) => (
      <> {new Date(submittedAt).toDateString()}</>
    ),
  },
  {
    key: "submittedAs",
    title: "Submitted as",
    dataIndex: "submittedAs",
    width: isMobile() ? 25 : 30,
    ellipsis: true,
  },
];

function Submissions() {
  const [submissionTable, setSubmissionTable] = useState<
    ISubmissionTable[] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  let navigate = useNavigate();

  useEffect(() => {
    async function fetchNames() {
      let submissions =
        getItem<ISubmission[]>(LOCAL_STORAGE_KEYS.SUBMISSIONS) ?? [];
      setIsLoading(true);
      let pubKeys = [
        ...submissions.map((submission) => submission.submittedAs),
        ...submissions.map((submission) => submission.formId),
      ];
      let profiles = await fetchProfiles(pubKeys);
      let submissionData = submissions.map((submission) => {
        return {
          key: makeTag(6),
          submittedAs: profiles[submission.submittedAs].name,
          formName: profiles[submission.formId].name,
          submittedAt: submission.submittedAt,
        };
      });
      setSubmissionTable(submissionData);
      setIsLoading(false);
    }
    if (!submissionTable) fetchNames();
  }, [submissionTable]);

  return (
    <div>
      {(submissionTable || isLoading) && (
        <Table
          columns={COLUMNS}
          loading={{
            spinning: isLoading,
            tip: "Fetching your submissions...",
          }}
          dataSource={submissionTable || []}
          pagination={false}
          scroll={{ y: "calc(100vh - 228px)" }}
        />
      )}
      {!submissionTable && !isLoading && (
        <EmptyScreen
          message="No submissions found, start by filling out a public form?"
          action={() => {
            navigate(ROUTES.PUBLIC_FORMS);
          }}
          actionLabel="Global Forms"
        />
      )}
    </div>
  );
}

export default Submissions;
