import { Button, Divider, Input, Typography } from "antd";
import AddNpubStyle from "../addNpub.style";
import { ReactNode, useState } from "react";
import { isValidNpub } from "./utils";
import { nip19 } from "nostr-tools";
import { CloseCircleOutlined } from "@ant-design/icons";

interface NpubListProps {
  NpubList: Set<string> | null;
  setNpubList: (npubs: Set<string>) => void;
  ListHeader: string;
}

export const NpubList: React.FC<NpubListProps> = ({
  setNpubList,
  NpubList,
  ListHeader,
}) => {
  const [newNpub, setNewNpub] = useState<string>();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const removeParticipant = (participant: string) => {
    const updatedList = new Set(NpubList);
    updatedList.delete(participant);
    setNpubList(updatedList);
  };

  const renderList = () => {
    const elements: ReactNode[] = [];
    (NpubList || new Set()).forEach(
      (value: string, key: string, set: Set<string>) => {
        elements.push(
          <li>
            <Typography.Text>
              {nip19.npubEncode(value).substring(0, 10) + "..."}
            </Typography.Text>
            <Button
              type="link"
              icon={<CloseCircleOutlined />}
              onClick={() => removeParticipant(value)}
              style={{ marginLeft: "10px" }} // Some margin for better spacing
            />
          </li>
        );
      }
    );
    return <ul>{elements}</ul>;
  };

  return (
    <div>
      <AddNpubStyle className="modal-container">
        <Typography.Text
          style={{
            fontSize: 18,
          }}
        >
          {ListHeader}
        </Typography.Text>
        <Divider />
        {renderList()}
        {!isModalOpen&&(<Input
          placeholder="Enter nostr npub"
          value={newNpub}
          onChange={(e) => setNewNpub(e.target.value)}
          className="npub-input"
        />)}
        {newNpub && !isValidNpub(newNpub) && (
          <div>
            <Typography.Text className="error-npub">
              this is not a valid npub
            </Typography.Text>
          </div>
        )}
        {isModalOpen && (
        <div >
            <h2>Granting Access To</h2>
             <p>{newNpub}</p>
            <Button
                type="primary"
            className="add-button"
              onClick={() => {
                setNpubList(
                  new Set(NpubList).add(nip19.decode(newNpub!).data as string)
                );
                setNewNpub("");
                setIsModalOpen(false);
              }}
            >{" "}
              Add{" "}
            </Button>
            <Button
              onClick={()=>{
                setNewNpub("");
                setIsModalOpen(false);
              }}
            >{" "}
              Cancel{" "}
            </Button>
        </div>
      )}
        {
          !isModalOpen&&(
            <Button
          type="primary"
          className="add-button"
          disabled={!isValidNpub(newNpub || "")}
          onClick={() => {
            setIsModalOpen(true);
          }}
        >
          {" "}
          Add{" "}
        </Button>
          )
        }
      </AddNpubStyle>
    </div>
  );
};
