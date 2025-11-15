import React from "react";

type Props = {
  questionId: string;
  text: string;
  yesNoAnswerText: Record<string, string>;
  setAnswer: (questionId: string, answer: boolean | number) => void;
  setYesNoAnswerText: (questionId: string, text: string) => void;
};

const ReferralQuestion: React.FC<Props> = ({ questionId, text, yesNoAnswerText, setAnswer, setYesNoAnswerText }) => {
  const referralOptions = ['Friends', 'Facebook', 'Instagram', 'Google', 'Other'];

  return (
    <tr className="align-middle border-t">
      <td className="py-2 pr-4 w-2/5">{text}</td>
      <td colSpan={11} className="py-2">
        <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
          {referralOptions.map((option) => (
            <label key={option} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name={questionId}
                value={option}
                checked={yesNoAnswerText[questionId] === option}
                onChange={() => {
                  setAnswer(questionId, true);
                  setYesNoAnswerText(questionId, option);
                }}
                className="appearance-none h-5 w-5 rounded-full border border-primary checked:bg-primary checked:border-primary cursor-pointer"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </td>
    </tr>
  );
};

export default ReferralQuestion;