import React, { useState, useEffect, useMemo } from "react";
// Assuming stores is two levels up
import { useReviewStore } from "../../stores/reviewStore";
import { useNavigate, useParams } from "react-router-dom";
// Assuming assets is two levels up
import logo from "../../assets/logo/logo_oshin.svg";
import toast from 'react-hot-toast'; // ✅ 1. Import toast

// Reusable components from your old App.tsx (Unchanged)
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
        error // Get submit error from store
    } = useReviewStore();

    useEffect(() => {
        resetReview(); // Reset state on load/category change
        if (category) {
            fetchQuestions(category);
        } else {
            navigate("/review/select");
        }
        // Reset local form state
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

        // --- Validation Start ---
        let firstErrorQuestionText: string | null = null;

        // 1. Check all rating questions
        for (const q of ratingQuestions) {
            const answer = answers[q._id];
            if (typeof answer !== 'number' || answer < 1 || answer > 10) {
                if (!firstErrorQuestionText) firstErrorQuestionText = q.text; // Store text of first unanswered question
                // Break after finding the first error for ratings
                break;
            }
        }
        if (firstErrorQuestionText) {
             toast.error(`Please provide a rating for: "${firstErrorQuestionText}"`);
             return; // Stop submission
        }


        // 2. Check all yes/no questions
        for (const q of yesNoQuestions) {
            const answer = answers[q._id];
            if (typeof answer !== 'boolean') {
                if (!firstErrorQuestionText) firstErrorQuestionText = q.text; // Store text
                 // Break after finding the first error for yes/no
                break;
            }
        }
         if (firstErrorQuestionText) {
             toast.error(`Please answer Yes or No for: "${firstErrorQuestionText}"`);
             return; // Stop submission
        }

        // 3. Check guest info if category is 'room'
        if (category === "room") {
            if (!guestName.trim()) {
                toast.error("Please enter the Guest Name.");
                return; // Stop submission
            }
            if (!guestPhone.trim()) {
                toast.error("Please enter the Guest Phone number.");
                return; // Stop submission
            }
             if (!guestRoom.trim()) {
                toast.error("Please enter the Guest Room number.");
                return; // Stop submission
            }
        }
        // --- Validation End ---


        // Build the payload (only if validation passes)
        const answersPayload = questions.map((q) => {
            const answer = answers[q._id];
            if (q.questionType === "rating") {
                return { question: q._id, rating: answer as number }; // Type assertion safe due to validation
            }
            return { question: q._id, answerBoolean: answer as boolean }; // Type assertion safe
        });

        const payload = {
            category,
            answers: answersPayload,
            description: description.trim(),
            roomGuestInfo:
                category === "room"
                    ? {
                        name: guestName.trim(),
                        phone: guestPhone.trim(),
                        roomNumber: guestRoom.trim(),
                    }
                    : undefined,
        };

        // Submit
        // @ts-ignore - Assuming submitReview handles the payload type
        const success = await submitReview(payload);
        if (success) {
            toast.success('Feedback submitted successfully!'); // Success toast
            setPage("thankyou");
        } else {
             // Error toast will be shown based on store's error state below
             // Optional: toast.error(error || 'Submission failed. Please try again.');
        }
    };

    const handleReset = () => {
        // resetReview(); // Called in useEffect on navigate
        navigate("/review/select");
    };

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
        // Design remains unchanged from your provided code
        <div className="min-h-screen bg-gray-100 font-sans">
            <div className="max-w-4xl mx-auto bg-white min-h-screen shadow-2xl flex flex-col">
                <header className="flex items-center flex-col py-5 bg-primary text-white">
                    <img src={logo} alt="Oshin Logo" className="w-28" />
                    <div>
                        <h1 className="text-3xl font-light tracking-wider">
                            Oshin Hotels & Resorts
                        </h1>
                    </div>
                </header>

                <main className="p-8">
                    {/* Intro Text Section */}
                    <div className="mb-8 text-gray-700 space-y-4">
                        <h2 className="text-2xl font-semibold text-gray-800">
                            Dear Valued Guest:
                        </h2>
                        <p>
                            Thank you for choosing Oshin Hotels & Resorts, we would greatly
                            appreciate you taking the time to complete a survey. Your
                            evaluation of our operations will provide us the opportunity to
                            assure that your future expectations are met and to provide you
                            with information about new initiatives and programs.{" "}
                        </p>
                        <p>
                            We appreciate your business and thank you for staying with the
                            Oshin Calicut. We invite you to share your thoughts, comments and
                            suggestions on your stay and help us to shape Oshin Hotels &
                            Resorts experience.
                        </p>
                        <p className="mt-4">
                            Sincere regards,<br /> Hotel Management </p>

                        <p className="font-semibold pt-4 border-t border-gray-200"> Please be sure to choose the option that best represents your opinion for all questions below. </p>
                    </div>

                    {/* Questions Table */}
                    <div className="overflow-x-auto"> {/* Added for potential horizontal scroll on smaller tablets */}
                      <table className="w-full border-collapse text-sm min-w-[600px]"> {/* Kept text-sm as per original code, added min-width */}
                          {/* --- RATING QUESTIONS --- */}
                          <thead>
                              <tr>
                                  <th className="w-2/5"></th>
                                  <th colSpan={10} className="py-2">
                                      <div className="flex items-center justify-between w-full">
                                          <span className="font-bold text-gray-600">Outstanding</span>
                                          <span className="font-bold text-gray-600">Unacceptable</span>
                                      </div>
                                  </th>
                              </tr>
                              <tr className=" font-semibold text-gray-600">
                                  <th className="pb-2 w-2/5 text-left">Please rate your experience</th>
                                  {["01","02","03","04","05","06","07","08","09","10"].map((num) => (
                                      <th key={num} className="pb-2 font-medium w-[4%]">{num}</th>
                                  ))}
                              </tr>
                          </thead>
                          <tbody>
                              {ratingQuestions.map((q) => (
                                  <tr key={q._id} className="align-middle border-t"> {/* Added border-t */}
                                      <td className="py-2 pr-4">{q.text}</td>
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

                          {/* --- YES/NO QUESTIONS --- */}
                          {yesNoQuestions.length > 0 && ( // Conditionally render if there are yes/no questions
                              <tbody className="border-t-2 border-gray-200 mt-4 pt-4"> {/* Added spacing */}
                                  {/* Optional: Add a header row for Yes/No if needed */}
                                  {/* <tr > ... <th>Yes</th><th>No</th> ... </tr> */}
                                  {yesNoQuestions.map((q) => (
                                      <tr key={q._id} className="align-middle border-t"> {/* Added border-t */}
                                          <td className="py-2 pr-4 w-2/5">{q.text}</td> {/* Added w-2/5 */}
                                          <YesNoBox
                                              name={q._id}
                                              value="yes"
                                              label="YES"
                                              checked={answers[q._id] === true}
                                              onChange={() => setAnswer(q._id, true)}
                                          />
                                          <YesNoBox
                                              name={q._id}
                                              value="no"
                                              label="NO"
                                              checked={answers[q._id] === false}
                                              onChange={() => setAnswer(q._id, false)}
                                          />
                                          <td colSpan={4}></td> {/* Adjusted colspan */}
                                      </tr>
                                  ))}
                              </tbody>
                          )}
                      </table>
                    </div>

                    {/* --- Open Feedback Section --- */}
                    <section className="mt-6">
                        <label className="text-sm font-medium text-gray-700 mb-2 block"> {/* Added block */}
                            Please tell us your overall experience:
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full mt-2 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Any memorable experiences or exceptional associates..."
                        />
                    </section>

                    {/* --- Guest Info (ROOMS ONLY) --- */}
                    {category === "room" && (
                        <section className="mt-6 p-4 border rounded-lg bg-gray-50">
                            <h3 className="text-lg font-semibold text-primary mb-4">
                                Guest Information
                            </h3>
                            <div className="space-y-4">
                                <DottedLineInput
                                    label="Guest Name"
                                    value={guestName}
                                    onChange={setGuestName}
                                />
                                <div className="flex flex-col md:flex-row gap-4"> {/* Added md:flex-row for responsiveness */}
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
                        </section>
                    )}

                    {/* --- Submit Button --- */}
                    <div className="mt-8 text-center">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                             // Kept original button styles
                            className="w-full max-w-xs bg-primary text-white py-3 rounded-lg font-semibold text-lg hover:bg-opacity-90 disabled:bg-gray-400"
                       >
                            {isSubmitting ? "Submitting..." : "Submit Feedback"}
                        </button>
                        {/* Display submit error from store */}
                        {error && (
                            <p className="text-red-500 mt-2">{error}</p>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ReviewPage;