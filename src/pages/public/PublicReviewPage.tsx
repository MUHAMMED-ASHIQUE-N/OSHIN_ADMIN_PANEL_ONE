import React, { useState, useEffect, useMemo } from "react";
import { useTokenStore } from "../../stores/tokenStore"; // Use token store
import { useNavigate, useParams } from "react-router-dom";
import logo from "../../assets/logo/logo_oshin.svg";
import toast from 'react-hot-toast';
import {  ReviewPayload, useReviewStore } from "../../stores/reviewStore"; // Import types

// --- Reusable Components (Copied from ReviewPage) ---
const DottedLineInput = ({ label, value, onChange }: { label: string; value: string; onChange: (val: string) => void }) => (
    <div className="flex items-baseline space-x-2 w-full">
        <label className="text-sm text-gray-800 whitespace-nowrap font-medium">{label}:</label>
        <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full border-b border-dotted border-gray-500 focus:outline-none focus:border-solid focus:border-primary"
        />
    </div>
);
const RadioBox = ({ name, value, checked, onChange }: { name: string; value: string; checked: boolean; onChange: () => void }) => (
    <td className="text-center py-2">
        <input
            type="radio"
            name={name}
            value={value}
            checked={checked}
            onChange={onChange}
            className="appearance-none h-5 w-5 rounded-full border border-primary checked:bg-primary checked:border-primary cursor-pointer"
        />
    </td>
);
const YesNoBox = ({ name, value, checked, onChange, label }: { name: string; value: string; checked: boolean; onChange: () => void; label: string }) => (
    <td colSpan={3} className="py-2">
        <label className="flex items-center justify-center space-x-2 cursor-pointer">
            <input
                type="radio"
                name={name}
                value={value}
                checked={checked}
                onChange={onChange}
                className="appearance-none h-5 w-5 border border-primary rounded-full checked:bg-primary checked:border-primary cursor-pointer"
            />
            <span>{label}</span>
        </label>
    </td>
);
// --- End Reusable Components ---

const PublicReviewPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState("review");

  // Local form state
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestRoom, setGuestRoom] = useState("");
  const [guestEmail, setGuestEmail] = useState(""); // ✅ ADD THIS LINE
  const [description, setDescription] = useState("");

  const {
    publicCategory,
    isPublicLoading,
    publicError,
    validateToken,
    submitPublicReview
  } = useTokenStore();
  
  const {
    questions, answers, yesNoAnswerText, // ✅ Get new text state
    isSubmitting, isLoading: isQuestionsLoading,
    fetchQuestions, setAnswer, setYesNoAnswerText, // ✅ Get new text action
    resetReview,
  } = useReviewStore();

  // 1. Validate token on mount
  useEffect(() => {
    resetReview(); // Reset answers from previous attempts
    if (token) {
      validateToken(token);
    } else {
      navigate('/login'); // No token
    }
  }, [token, validateToken, navigate, resetReview]); // Added resetReview

  // 2. Fetch questions AFTER token is validated
  useEffect(() => {
    if (publicCategory) {
      fetchQuestions(publicCategory);
    }
  }, [publicCategory, fetchQuestions]);

  // 3. Memoize questions
  const { ratingQuestions, yesNoQuestions } = useMemo(() => {
    return {
      ratingQuestions: questions.filter((q) => q.questionType === "rating"),
      yesNoQuestions: questions.filter((q) => q.questionType === "yes_no"),
    };
  }, [questions]);

  // 4. Handle Submit
const handleSubmit = async () => {
    if (!publicCategory || !token) return;

    // --- Validation ---
    if (publicCategory === "room") {
        if (!guestName.trim()) { toast.error("Please enter the Guest Name."); return; }
        if (!guestPhone.trim()) { toast.error("Please enter the Guest Phone number."); return; }
        if (!guestRoom.trim()) { toast.error("Please enter the Guest Room number."); return; }
    }
    // ✅ ADDED F&B/CFC VALIDATION
    if (publicCategory === "f&b" || publicCategory === "cfc") {
        if (!guestEmail.trim()) {
            toast.error("Please enter the Guest Email.");
            return;
        }
        if (!/\S+@\S+\.\S+/.test(guestEmail)) {
           toast.error("Please enter a valid email address.");
           return;
        }
    }
    // --- End Validation ---

    // ... (Your answersPayload logic is correct) ...
    const answersPayload = Object.keys(answers)
       .filter(questionId => answers[questionId] !== null && answers[questionId] !== undefined)
       .map(questionId => {
           const question = questions.find(q => q._id === questionId);
           const answer = answers[questionId];

           if (question?.questionType === "rating") {
               return { question: questionId, rating: answer as number };
           }
           if (question?.questionType === "yes_no") {
               const text = yesNoAnswerText[questionId];
               return {
                   question: questionId,
                   answerBoolean: answer as boolean,
                   answerText: answer === true ? text : undefined 
               };
           }
           return null;
       })
       .filter(Boolean) as ReviewPayload['answers'];

    // ✅ Dynamically create the guestInfo payload
    const getGuestInfo = () => {
        if (publicCategory === 'room') {
            return {
                name: guestName.trim(),
                phone: guestPhone.trim(),
                roomNumber: guestRoom.trim(),
            };
        }
        if (publicCategory === 'f&b' || publicCategory === 'cfc') {
            return {
                email: guestEmail.trim(),
            };
        }
        return undefined;
    };

const payload: ReviewPayload = {
    category: publicCategory,
    answers: answersPayload,
    description: description.trim(),
    guestInfo: getGuestInfo(), // ✅ Correctly named 'guestInfo'
};

    const success = await submitPublicReview(token, payload);
    if (success) {
        toast.success('Feedback submitted successfully!');
        setPage("thankyou");
        resetReview();
    }
    // Error is handled by publicError
};
  // --- Render Logic ---
  if (isPublicLoading || isQuestionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-primary animate-pulse">Loading Review Form...</p>
      </div>
    );
  }

if (publicError && !isSubmitting) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-gray-100">
         <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
           <h2 className="text-3xl font-semibold text-red-600 mb-4">Link Invalid</h2>
           <p className="text-lg text-gray-700 mb-8">{publicError}</p>
         </div>
       </div>
     );
  }

  // Thank you page
  if (page === "thankyou") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <svg className="w-16 h-16 mx-auto text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <h2 className="text-3xl font-semibold text-primary mb-4">Thank You!</h2>
          <p className="text-lg text-primary mb-8">  Looking forward to welcome you back Yet another Remarkable stay with Oshin Hotels & Resorts
          </p>
          {/* No "Submit Another" button for public link */}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="max-w-4xl mx-auto bg-white min-h-screen shadow-2xl flex flex-col">
        <header className="flex items-center flex-col py-5 bg-primary text-white">
          <img src={logo} alt="Oshin Logo" className="w-28" />
          <div><h1 className="text-3xl font-light tracking-wider">Oshin Hotels & Resorts</h1></div>
        </header>

        <main className="p-8">
          {/* Intro Text */}
          <div className="mb-8 text-gray-700 space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">Dear Valued Guest:</h2>
            <p>
                Thank you for choosing Oshin Hotels & Resorts, we would greatly
                appreciate you taking the time to complete a survey...
            </p>
            <p>
                We appreciate your business and thank you for staying with the
                Oshin Calicut. We invite you to share your thoughts, comments and
                suggestions on your stay...
            </p>
            <p className="mt-4">
                Sincere regards,<br /> Hotel Management </p>
            <p className="font-semibold pt-4 border-t border-gray-200">
              Please be sure to choose the option that best represents your opinion.
            </p>
          </div>

          {/* Questions Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm min-w-[600px]">
              {/* Rating Questions Header */}
              <thead>
                <tr>
                  <th className="w-2/5"></th>
                  <th colSpan={10} className="py-2">
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-gray-600">Outstanding</span>
                      <span className="font-bold text-gray-600">Unacceptable</span>
                    </div>
                  </th>
                  <th className="w-[4%]"></th>
                </tr>
                <tr className=" font-semibold text-gray-600">
                  <th className="pb-2 w-2/5 text-left">Please rate your experience</th>
                  {["10", "09", "08", "07", "06", "05", "04", "03", "02", "01"].map((num) => (
                    <th key={num} className="pb-2 font-medium w-[4%]">{num}</th>
                  ))}
                  <th className="pb-2 font-medium w-[4%] text-center">N/A</th>
                </tr>
              </thead>
              {/* Rating Questions Body */}
              <tbody>
                {ratingQuestions.map((q) => (
                  <tr key={q._id} className="align-middle border-t">
                    <td className="py-2 pr-4">{q.text}</td>
                    {Array.from({ length: 10 }).map((_, j) => {
                      const ratingValue = 10 - j;
                      return (
                        <RadioBox
                          key={j} name={q._id} value={`${ratingValue}`}
                          checked={answers[q._id] === ratingValue}
                          onChange={() => setAnswer(q._id, ratingValue)}
                        />
                      );
                    })}
                    <RadioBox
                      name={q._id} value="0"
                      checked={answers[q._id] === 0}
                      onChange={() => setAnswer(q._id, 0)}
                    />
                  </tr>
                ))}
              </tbody>
              {/* Yes/No Questions Body */}
            {yesNoQuestions.length > 0 && (
                <tbody className="border-t-2 border-gray-200 mt-4 pt-4">
                  {yesNoQuestions.map((q) => (
                    // ✅ Use React.Fragment to group row and text input row
                    <React.Fragment key={q._id}>
                      <tr className="align-middle border-t">
                        <td className="py-2 pr-4 w-2/5">{q.text}</td>
                        <YesNoBox
                          name={q._id} value="yes" label="YES"
                          checked={answers[q._id] === true}
                          onChange={() => setAnswer(q._id, true)}
                        />
                        <YesNoBox
                          name={q._id} value="no" label="NO"
                          checked={answers[q._id] === false}
                          onChange={() => setAnswer(q._id, false)}
                        />
                        <td colSpan={4}></td>
                        <td></td>
                      </tr>
                      
                      {/* ✅ UPDATED: Conditionally render text input row ONLY for f&b and cfc */}
                      {answers[q._id] === true && (publicCategory === "f&b" || publicCategory === "cfc") && (
                        <tr className="align-middle border-b">
                            <td className="py-2 pr-4 text-right italic text-gray-600">
                                Please specify:
                            </td>
                            <td colSpan={11} className="py-2">
                                <input
                                    type="text"
                                    value={yesNoAnswerText[q._id] || ''}
                                    onChange={(e) => setYesNoAnswerText(q._id, e.target.value)}
                                    placeholder="Optional comment..."
                                    className="w-full text-sm p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              )}
            </table>
          </div>

            
<section className="mt-6">
    <label className="text-sm font-medium text-gray-700 mb-2 block">
        Please tell us your overall experience and in particular any memorable experience or exceptional associate you have encountered during your stay (please be specific)
    </label>
    <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
        className="w-full mt-2 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder="Any memorable experiences or exceptional associates..."
    />
</section>

{/* --- Guest Info Section (Now Conditional) --- */}
<section className="mt-6 p-4 border rounded-lg bg-gray-50">
    <h3 className="text-lg font-semibold text-primary mb-4">
        Guest Information
    </h3>

    {/* === ROOM GUEST INFO === */}
    {publicCategory === "room" && (
        <div className="space-y-4">
             <DottedLineInput
                label="Guest Name"
                value={guestName}
                onChange={setGuestName}
            />
            <div className="flex flex-col md:flex-row gap-4">
                <DottedLineInput
                    label="Phone"
                    value={guestPhone}
                    onChange={setGuestPhone}
                />
                <DottedLineInput
                    label="Room No"
                    value={guestRoom}
                    onChange={setGuestRoom}
                />
            </div>
        </div>
    )}

    {/* === F&B or CFC GGUEST INFO === */}
    {(publicCategory === "f&b" || publicCategory === "cfc") && (
        <div className="space-y-4">
            <DottedLineInput
                label="Guest Email"
                value={guestEmail}
                onChange={setGuestEmail}
            />
        </div>
    )}
</section>
          {/* ✅ END: Conditional Room-Only Section */}


          {/* --- Submit Button --- */}
          <div className="mt-8 text-center">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full max-w-xs bg-primary text-white py-3 rounded-lg font-semibold text-lg hover:bg-opacity-90 disabled:bg-gray-400"
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </button>
            {publicError && (
              <p className="text-red-500 mt-2">{publicError}</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PublicReviewPage;