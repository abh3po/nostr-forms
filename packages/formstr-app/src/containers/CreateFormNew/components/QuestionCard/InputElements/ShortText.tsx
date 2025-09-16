import { Input } from "antd";

interface ShortTextProps {}

const shortText: React.FC<ShortTextProps> = () => {
  return (
    <>
      <Input
        placeholder="Type your answer here"
        bordered={false}
        disabled
        style={{
          paddingLeft: 0,
          // borderBottom: "0.5px solid black",
          borderRadius: 0,
        }}
      />
    </>
  );
};

export default shortText;
