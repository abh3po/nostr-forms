import { DownOutlined } from '@ant-design/icons';
import { V1Field } from '@formstr/sdk/dist/interfaces';
import { Dropdown, MenuProps } from 'antd';
import React from 'react';

export const Export: React.FC<{
  questionMap: { [key: string]: V1Field };
  answers: Array<{ [key: string]: string }>;
  formName: string;
}> = (props) => {
  const onDownloadClick = async (type: 'csv' | 'excel') => {
    const XLSX = await import('xlsx');
    const SheetName = `Responses for ${props.formName}`.substring(0, 16) + '...';
    let parsedResponse = props.answers.reduce(
      (allResp: Array<{ [key: string]: string }>, answer: { [key: string]: string }) => {
        let newAnswer: { [key: string]: string } = {};
        Object.keys(answer).forEach((questionId) => {
          newAnswer[props.questionMap[questionId]?.question || questionId] = answer[questionId];
        });
        allResp.push(newAnswer);
        return allResp;
      },
      [],
    );

    const workSheet = XLSX.utils.json_to_sheet(parsedResponse);
    const workBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, workSheet, `${SheetName}`);
    if (type === 'excel') {
      XLSX.writeFile(workBook, `${SheetName}.xlsx`);
    } else {
      XLSX.writeFile(workBook, `${SheetName}.csv`);
    }
  };

  const items = [
    {
      label: 'Export as Excel',
      key: 'excel',
    },
    {
      label: 'Export as CSV',
      key: 'csv',
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    onDownloadClick(e.key as 'csv' | 'excel');
  };

  const menuProps: MenuProps = {
    items,
    onClick: handleMenuClick,
  };

  const handleButtonClick = () => {
    onDownloadClick('excel');
  };

  return (
    <Dropdown.Button
      menu={menuProps}
      className="export-excel"
      type="text"
      onClick={handleButtonClick}
      icon={<DownOutlined />}
    >
      Export as excel
    </Dropdown.Button>
  );
};
