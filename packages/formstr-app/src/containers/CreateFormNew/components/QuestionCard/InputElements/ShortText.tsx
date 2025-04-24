import { Input } from 'antd';
// import QuestionContext from "../../QuestionContext";
// import { AnswerTypes } from "@formstr/sdk/dist/interfaces";

// {
//   <Input
//   placeholder="Type your answer here"
//   bordered={false}
//   disabled
//   style={{
//     paddingLeft: 0,
//     // borderBottom: "0.5px solid black",
//     borderRadius: 0,
//   }}
// />;
// }

// interface ShortTextInputSettings {
//   validations: Array<string>;
// }
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
