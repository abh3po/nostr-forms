import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Checkbox, Radio, Typography } from "antd";
import { useState, useEffect } from "react";
import { GridOptions } from "../../../../../nostr/types";
import { makeTag } from "../../../../../utils/utility";
import { ColorfulMarkdownTextarea } from "../../../../../components/SafeMarkdown/ColorfulMarkdownInput";
import styled from "styled-components";

const { Text } = Typography;

interface GridCreatorProps {
  initialValue?: GridOptions;
  onValuesChange: (options: GridOptions) => void;
  allowMultiple: boolean; // Radio vs checkbox mode
}

type GridItem = [id: string, label: string, config?: string];

const GridCreatorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 16px 0;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled(Text)`
  font-weight: 600;
  font-size: 14px;
  color: #595959;
`;

const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #fafafa;
  border-radius: 4px;

  .ant-input {
    flex: 1;
  }

  .anticon-close {
    cursor: pointer;
    color: #8c8c8c;
    &:hover {
      color: #ff4d4f;
    }
  }
`;

const GridPreview = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;

  th,
  td {
    padding: 12px;
    text-align: center;
    border: 1px solid #e0e0e0;
  }

  th:first-child,
  td:first-child {
    text-align: left;
    font-weight: 500;
    background: #fafafa;
  }

  thead th {
    background: #f5f5f5;
    font-weight: 600;
  }
`;

export const GridCreator: React.FC<GridCreatorProps> = ({
  initialValue,
  onValuesChange,
  allowMultiple,
}) => {
  const [columns, setColumns] = useState<GridItem[]>(
    initialValue?.columns || [
      [makeTag(6), "Column 1", "{}"],
      [makeTag(6), "Column 2", "{}"],
    ]
  );
  const [rows, setRows] = useState<GridItem[]>(
    initialValue?.rows || [
      [makeTag(6), "Row 1", "{}"],
      [makeTag(6), "Row 2", "{}"],
    ]
  );

  useEffect(() => {
    onValuesChange({ columns, rows });
  }, [columns, rows]);

  const handleColumnAdd = () => {
    const newColumn: GridItem = [makeTag(6), `Column ${columns.length + 1}`, "{}"];
    setColumns([...columns, newColumn]);
  };

  const handleColumnDelete = (id: string) => {
    if (columns.length > 1) {
      setColumns(columns.filter((col) => col[0] !== id));
    }
  };

  const handleColumnLabelChange = (id: string, label: string) => {
    setColumns(
      columns.map((col) => (col[0] === id ? [col[0], label, col[2] || "{}"] : col))
    );
  };

  const handleRowAdd = () => {
    const newRow: GridItem = [makeTag(6), `Row ${rows.length + 1}`, "{}"];
    setRows([...rows, newRow]);
  };

  const handleRowDelete = (id: string) => {
    if (rows.length > 1) {
      setRows(rows.filter((row) => row[0] !== id));
    }
  };

  const handleRowLabelChange = (id: string, label: string) => {
    setRows(
      rows.map((row) => (row[0] === id ? [row[0], label, row[2] || "{}"] : row))
    );
  };

  const hasEmptyLabels = () => {
    return (
      columns.some((col) => !col[1]?.trim()) ||
      rows.some((row) => !row[1]?.trim())
    );
  };

  return (
    <GridCreatorContainer>
      {/* Columns Section */}
      <Section>
        <SectionTitle>Columns</SectionTitle>
        <ItemList>
          {columns.map((column) => {
            const [id, label] = column;
            return (
              <Item key={id}>
                <ColorfulMarkdownTextarea
                  value={label}
                  onChange={(val) => handleColumnLabelChange(id, val)}
                  placeholder="Enter column label"
                  className="choice-input"
                />
                {columns.length > 1 && (
                  <CloseOutlined onClick={() => handleColumnDelete(id)} />
                )}
              </Item>
            );
          })}
        </ItemList>
        <Button
          type="dashed"
          onClick={handleColumnAdd}
          icon={<PlusOutlined />}
          disabled={hasEmptyLabels() || columns.length >= 10}
        >
          Add Column
        </Button>
      </Section>

      {/* Rows Section */}
      <Section>
        <SectionTitle>Rows</SectionTitle>
        <ItemList>
          {rows.map((row) => {
            const [id, label] = row;
            return (
              <Item key={id}>
                <ColorfulMarkdownTextarea
                  value={label}
                  onChange={(val) => handleRowLabelChange(id, val)}
                  placeholder="Enter row label"
                  className="choice-input"
                />
                {rows.length > 1 && (
                  <CloseOutlined onClick={() => handleRowDelete(id)} />
                )}
              </Item>
            );
          })}
        </ItemList>
        <Button
          type="dashed"
          onClick={handleRowAdd}
          icon={<PlusOutlined />}
          disabled={hasEmptyLabels() || rows.length >= 10}
        >
          Add Row
        </Button>
      </Section>

      {/* Grid Preview */}
      <Section>
        <SectionTitle>Preview</SectionTitle>
        <GridPreview>
          <thead>
            <tr>
              <th></th>
              {columns.map((col) => (
                <th key={col[0]}>{col[1] || "Column"}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]}>
                <td>{row[1] || "Row"}</td>
                {columns.map((col) => (
                  <td key={col[0]}>
                    {allowMultiple ? (
                      <Checkbox disabled />
                    ) : (
                      <Radio disabled />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </GridPreview>
      </Section>
    </GridCreatorContainer>
  );
};
