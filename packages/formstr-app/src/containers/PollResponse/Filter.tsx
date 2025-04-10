import { Dropdown, Menu, Divider } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import React from "react";
import { Event } from "nostr-tools";
import { useListContext } from "../../hooks/useListContext/useListContext";
import { useUserContext } from "../../hooks/useUserContext";
import type { MenuProps } from "antd";

interface FilterProps {
  onChange: (pubkeys: string[]) => void;
}

export const Filters: React.FC<FilterProps> = ({ onChange }) => {
  const [open, setOpen] = React.useState<boolean>(false);
  const { lists, handleListSelected, selectedList } = useListContext();
  const { user } = useUserContext();

  const handleAllPosts = () => {
    handleListSelected(null);
    onChange([]);
    setOpen(false);
  };

  const handleFilterChange = (value: string) => {
    handleListSelected(value);
    const selectedList = lists?.get(value);
    const pubkeys =
      selectedList?.tags.filter((t) => t[0] === "p").map((t) => t[1]) || [];
    onChange(pubkeys);
    setOpen(false);
  };

  const getMenuItems = (): MenuProps["items"] => {
    const items: MenuProps["items"] = [
      {
        key: "all-votes",
        label: "all votes",
        className: !selectedList ? "ant-menu-item-selected" : "",
        onClick: () => handleAllPosts()
      }
    ];

    if (lists) {
      items.push({ type: "divider" });

      if (lists.has(`3:${user?.pubkey}`)) {
        items.push({
          key: `3:${user?.pubkey}`,
          label: "people you follow",
          className: selectedList === `3:${user?.pubkey}` ? "ant-menu-item-selected" : "",
          onClick: () => handleFilterChange(`3:${user?.pubkey}`)
        });
        items.push({ type: "divider" });
      }

      Array.from(lists?.entries() || []).forEach((value: [string, Event]) => {
        if (value[1].kind === 3) return;
        const listName =
          value[1].tags
            .filter((tag) => tag[0] === "d")
            .map((tag) => tag[1])[0] || `kind:${value[1].kind}`;

        items.push({
          key: value[0],
          label: listName,
          className: value[0] === selectedList ? "ant-menu-item-selected" : "",
          onClick: () => handleFilterChange(value[0])
        });
      });

      items.push({ type: "divider" });
    }

    items.push({
      key: "create-list",
      label: "+ create a new list",
      onClick: () => {
        window.open("https://listr.lol", "_blank");
      }
    });

    return items;
  };

  return (
    <div style={{ bottom: 0, cursor: "pointer" }}>
      <Dropdown
        overlay={<Menu items={getMenuItems()} selectedKeys={selectedList ? [selectedList] : ["all-votes"]} />}
        open={open}
        onOpenChange={(flag) => setOpen(flag)}
        trigger={["click"]}
      >
        <FilterOutlined
          style={{
            position: "relative",
            bottom: -6,
            marginRight: 5,
            color: "black",
            opacity: 1,
            fontSize: "20px"
          }}
        />
      </Dropdown>
    </div>
  );
};