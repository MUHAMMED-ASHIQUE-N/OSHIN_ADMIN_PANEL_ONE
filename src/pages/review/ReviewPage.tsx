import React, { useState, useEffect, useMemo } from "react";
// Assuming stores is two levels up
import { useReviewStore } from "../../stores/reviewStore";
import { useNavigate, useParams } from "react-router-dom";
// Assuming assets is two levels up
import logo from "../../assets/logo/logo_oshin.svg";
import toast from 'react-hot-toast';

// Reusable components
const DottedLineInput = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) => (
  <div className="flex items-baseline space-x-2 w-full">
    <label className="text-base text-gray-800 whitespace-nowrap font-medium">{label}:</label> {/* Increased label size */}
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full border-b border-dotted border-gray-500 focus:outline-none focus:border-solid focus:border-primary text-base" /* Increased input text size */
    />
  </div>
);

const RadioBox = ({
  name,
  value,
  checked,
  onChange,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
}) => (
  <td className="text-center py-3"> {/* Increased padding */}
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
      className="appearance-none h-6 w-10 border border-gray-400 rounded-md checked:bg-primary checked:border-primary cursor-pointer transition-colors" /* Slightly larger, rounded */
    />
  </td>
);

const YesNoBox = ({
  name,
  value,
  checked,
  onChange,
  label,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  label: string;
}) => (
  <td colSpan={3} className="py-3"> {/* Increased padding */}
    <label className="flex items-center justify-center space-x-3 cursor-pointer"> {/* Increased spacing */}
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="appearance-none h-6 w-10 border border-gray-400 rounded-md checked:bg-primary checked:border-primary cursor-pointer transition-colors" /* Slightly larger, rounded */
      />
      {/* Label is now rendered inside YesNoBox, but text comes from props */}
      <span className="text-base">{label}</span> {/* Increased label size */}
    </label>
  </td>
);


// --- Main Review Page Component ---
const ReviewPage: React.FC = () => {
    const { category } = useParams<{ category: "room" | "f&b" }>();
    const navigate = useNavigate();
    const [page, setPage] = useState("review");

    const [guestName, setGuestName] = useState("");
    const [guestPhone, setGuestPhone] = useState("");
    const [guestRoom, setGuestRoom] = useState("");
    const [description, setDescription] = useState("");

    const {
        questions,
        answers,
        isSubmitting,
        isLoading,
        fetchQuestions,
        setAnswer,
        submitReview,
        resetReview,
        error
    } = useReviewStore();

     useEffect(() => {
        resetReview();
        if (category) {
            fetchQuestions(category);
        } else {
            navigate("/review/select");
        }
        setGuestName("");
        setGuestPhone("");
        setGuestRoom("");
        setDescription("");
        setPage("review");
    }, [category, fetchQuestions, navigate, resetReview]);

    const { ratingQuestions, yesNoQuestions } = useMemo(() => {
        return {
            ratingQuestions: questions.filter((q) => q.questionType === "rating"),
            yesNoQuestions: questions.filter((q) => q.questionType === "yes_no"),
        };
    }, [questions]);

     const handleSubmit = async () => {
        if (!category) return;
        let firstErrorQuestionText: string | null = null;
        for (const q of ratingQuestions) {
            const answer = answers[q._id];
            if (typeof answer !== 'number' || answer < 1 || answer > 10) {
                if (!firstErrorQuestionText) firstErrorQuestionText = q.text;
                break;
            }
        }
        if (firstErrorQuestionText) {
             toast.error(`Please provide a rating for: "${firstErrorQuestionText}"`);
             return;
        }
        for (const q of yesNoQuestions) {
            const answer = answers[q._id];
            if (typeof answer !== 'boolean') {
                if (!firstErrorQuestionText) firstErrorQuestionText = q.text;
                break;
            }
        }
         if (firstErrorQuestionText) {
             toast.error(`Please answer Yes or No for: "${firstErrorQuestionText}"`);
             return;
        }
        if (category === "room") {
            if (!guestName.trim()) { toast.error("Please enter the Guest Name."); return; }
            if (!guestPhone.trim()) { toast.error("Please enter the Guest Phone number."); return; }
             if (!guestRoom.trim()) { toast.error("Please enter the Guest Room number."); return; }
        }
        const answersPayload = questions.map((q) => {
            const answer = answers[q._id];
            if (q.questionType === "rating") {
                return { question: q._id, rating: answer as number };
            }
            return { question: q._id, answerBoolean: answer as boolean };
        });
        const payload = {
            category,
            answers: answersPayload,
            description: description.trim(),
            roomGuestInfo:
                category === "room"
                    ? { name: guestName.trim(), phone: guestPhone.trim(), roomNumber: guestRoom.trim() }
                    : undefined,
        };
        // @ts-ignore
        const success = await submitReview(payload);
        if (success) { toast.success('Feedback submitted successfully!'); setPage("thankyou"); }
    };

    const handleReset = () => { navigate("/review/select"); };

    if (isLoading) {
        return (
             <div className="min-h-screen flex items-center justify-center">
                 <p className="text-xl text-primary animate-pulse">Loading Questions...</p>
             </div>
        );
    }

    if (page === "thankyou") {
         return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                   <svg className="w-16 h-16 mx-auto text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <h2 className="text-3xl font-semibold text-primary mb-4">Thank You!</h2>
                  <p className="text-lg text-gray-700 mb-8">
                      Your feedback has been submitted successfully.
                  </p>
                  <button
                      onClick={handleReset}
                      className="px-8 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90 transition-colors"
                  >
                      Submit Another Review
                  </button>
              </div>
          </div>
        );
    }


    return (
        <div className="min-h-screen bg-gray-100 font-sans p-6 md:p-10">
            <div className="max-w-4xl mx-auto bg-white min-h-screen shadow-2xl flex flex-col rounded-lg overflow-hidden">
                 <header className='flex items-center justify-center flex-col py-6 bg-primary text-white'>
                    <img src={logo} alt="Oshin Logo" className='w-32 mb-2'/>
                    <h1 className="text-4xl font-light tracking-wider">Oshin Hotels & Resorts</h1>
                </header>

                <main className="p-6 md:p-10 flex-grow">
                     <div className="mb-8 text-gray-700 space-y-4">
                        <h2 className="text-2xl font-semibold text-gray-800">Dear Valued Guest:</h2>
                        <p>
                            Thank you for choosing Oshin Hotels & Resorts, we would greatly
                            appreciate you taking the time to complete a survey. Your
                            evaluation of our operations will provide us the opportunity to
                            assure that your future expectations are met and to provide you
                            with information about new initiatives and programs.
                        </p>
                        <p>
                            We appreciate your business and thank you for staying with the
                            Oshin Calicut. We invite you to share your thoughts, comments and
                            suggestions on your stay and help us to shape Oshin Hotels &
                            Resorts experience.
                        </p>
                        <p className="mt-4">Sincere regards,<br /> Hotel Management </p>
                        <p className="font-semibold pt-4 border-t border-gray-200">
                            Please be sure to choose the option that best represents your opinion for all questions below.
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-base min-w-[600px]">
                            {/* --- RATING QUESTIONS --- */}
                            { ratingQuestions.length > 0 && (
                                <>
                                    <thead>
                                        <tr>
                                            <th className="w-2/5"></th>
                                            <th colSpan={10} className="py-3">
                                                <div className="flex items-center justify-between w-full px-4">
                                                    <span className="font-semibold text-gray-700 text-lg">Outstanding</span>
                                                    <span className="font-semibold text-gray-700 text-lg">Unacceptable</span>
                                                </div>
                                            </th>
                                        </tr>
                                        <tr className="text-sm font-semibold text-gray-600">
                                            <th className="pb-3 w-2/5 text-left font-medium">Please rate your experience</th>
                                            {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'].map(num => (
                                                <th key={num} className="pb-3 font-medium w-[5%]">{num}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ratingQuestions.map((q, index) => (
                                            <tr key={q._id} className={`align-middle ${index > 0 ? 'border-t' : ''}`}>
                                                <td className="py-4 pr-4">{q.text}</td>
                                                {Array.from({ length: 10 }).map((_, j) => (
                                                    <RadioBox
                                                        key={j}
                                                        name={q._id}
                                                        value={`${j + 1}`}
                                                        checked={answers[q._id] === j + 1}
                                                        onChange={() => setAnswer(q._id, j + 1)}
                                                    />
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </>
                            )}

                            {/* --- YES/NO QUESTIONS --- */}
                            { yesNoQuestions.length > 0 && (
                                <tbody className={ratingQuestions.length > 0 ? "border-t-2 border-gray-200" : ""}>
                                    <tr>
                                        <th className={`w-2/5 text-left pr-4 font-medium text-sm text-gray-600 ${ratingQuestions.length > 0 ? 'pt-8 pb-4' : 'py-4'}`}>
                                            Please answer Yes or No
                                        </th>
                                        <th colSpan={3} className={`font-medium text-sm text-gray-600 ${ratingQuestions.length > 0 ? 'pt-8 pb-4' : 'py-4'}`}>YES</th>
                                        <th colSpan={3} className={`font-medium text-sm text-gray-600 ${ratingQuestions.length > 0 ? 'pt-8 pb-4' : 'py-4'}`}>NO</th>
                                        <th colSpan={3} className={`${ratingQuestions.length > 0 ? 'pt-8 pb-4' : 'py-4'}`}></th> {/* Spacer */}
                                    </tr>
                                    {yesNoQuestions.map((q, _) => (
                                        <tr key={q._id} className={`align-middle border-t`}>
                                            <td className="py-4 pr-4 w-2/5">{q.text}</td>
                                            <YesNoBox
                                                name={q._id}
                                                value="yes"
                                                label="" // Removed label text
                                                checked={answers[q._id] === true}
                                                onChange={() => setAnswer(q._id, true)}
                                            />
                                            <YesNoBox
                                                name={q._id}
                                                value="no"
                                                label="" // Removed label text
                                                checked={answers[q._id] === false}
                                                onChange={() => setAnswer(q._id, false)}
                                            />
                                            <td colSpan={3}></td>
                                        </tr>
                                    ))}
                                </tbody>
                            )}
                        </table>
                    </div>

                    {/* --- Open Feedback Section --- */}
                    <section className="mt-8">
                         <label className="text-base font-medium text-gray-700 mb-2 block">
                           Please tell us your overall experience:
                         </label>
                         <textarea
                           value={description}
                           onChange={e => setDescription(e.target.value)}
                           rows={5}
                           className="w-full mt-2 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary text-base"
                           placeholder="Any memorable experiences or exceptional associates..."
                         />
                    </section>

                    {/* --- Guest Info (ROOMS ONLY) --- */}
                    {category === "room" && (
                         <section className="mt-8 p-6 border rounded-lg bg-gray-50">
                             <h3 className="text-xl font-semibold text-primary mb-6">Guest Information</h3>
                             <div className="space-y-6">
                                <DottedLineInput label="Guest Name" value={guestName} onChange={setGuestName} />
                                <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                                  <DottedLineInput label="Phone" value={guestPhone} onChange={setGuestPhone} />
                                  <DottedLineInput label="Room No" value={guestRoom} onChange={setGuestRoom} />
                                </div>
                             </div>
                         </section>
                    )}

                    {/* --- Submit Button --- */}
                    <div className="mt-10 text-center">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-full max-w-sm bg-primary text-white py-4 px-8 rounded-full font-semibold text-xl hover:bg-opacity-90 disabled:bg-gray-400 transition-colors shadow-md"
                        >
                            {isSubmitting ? "Submitting..." : "Submit Feedback"}
                        </button>
                        {/* Display submit error from store */}
                        {error && (
                            <p className="text-red-600 mt-4 text-center text-lg">{error}</p>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ReviewPage;