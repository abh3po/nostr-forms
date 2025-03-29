import React from "react";
import { Dropdown, MenuProps } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { V1Field } from "@formstr/sdk/dist/interfaces";

export const Export: React.FC<{
  responsesData: Array<{ [key: string]: string }>;
  formName: string;
}> = ({ responsesData, formName }) => {
  const hasResponses = responsesData.length > 0;

  const onDownloadClick = async (type: "csv" | "excel") => {
    if (!hasResponses) {
      alert("No responses to export");
      return;
    }

   try {
    const XLSX = await import("xlsx");
    const SheetName = `Responses for ${formName}`.substring(0, 16) + "...";
    const workSheet = XLSX.utils.json_to_sheet(responsesData);
    const workBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, workSheet, `${SheetName}`);

    const fileExtension = type === "excel" ? ".xlsx" : ".csv";
    XLSX.writeFile(workBook, `${SheetName}.${fileExtension}`);
    
   } catch (error) {
      console.error("Error exporting data:", error);
      alert("Error exporting data");
      return;
    }

  };

  const items = [
    {
      label: "Export as Excel",
      key: "excel",
    },
    {
      label: "Export as CSV",
      key: "csv",
    },
  ];

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    onDownloadClick(e.key as "csv" | "excel");
  };

  const menuProps: MenuProps = {
    items,
    onClick: handleMenuClick,
  };

  const handleButtonClick = () => {
    onDownloadClick("excel");
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
