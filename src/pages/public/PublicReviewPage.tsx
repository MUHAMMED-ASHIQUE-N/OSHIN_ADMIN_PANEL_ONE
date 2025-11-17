import React, { useState, useEffect, useMemo } from "react";
import { useTokenStore } from "../../stores/tokenStore"; // Use token store
import { useNavigate, useParams } from "react-router-dom";
// import logo from "../../assets/logo/logo_oshin.svg"; // Use generic logo

// Removed unused Calicut and Wayanad logos
import Calicut_logo from "../../assets/logo/Oshiln_logo_calicut.svg";
import wayanad_logo from "../../assets/logo/oshin_wayanad_logo.svg";

import toast from "react-hot-toast";
import { ReviewPayload, useReviewStore } from "../../stores/reviewStore"; // Import types
// import { useAuthStore } from "../../stores/authStore";

// --- Reusable Components (Copied from ReviewPage) ---
const DottedLineInput = ({
    label,
    value,
    onChange,
    type = "text",     // ✅ ADDED: Default to "text"
    inputMode,         // ✅ ADDED
    maxLength          // ✅ ADDED
}: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    type?: string;     // ✅ ADDED
    inputMode?: "numeric" | "text" | "tel" | "email"; // ✅ ADDED
    maxLength?: number; // ✅ ADDED
}) => (
    <div className="flex items-baseline space-x-2 w-full">
        <label className="text-sm text-gray-800 whitespace-nowrap font-medium">
            {label}:
        </label>
        <input
            type={type}         // ✅ UPDATED
            inputMode={inputMode} // ✅ ADDED
            maxLength={maxLength} // ✅ ADDED
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full border-b border-dotted border-gray-500 focus:outline-none focus:border-solid focus:border-primary"
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
  <td colSpan={3} className="py-2">
    <label className="flex items-center justify-center space-x-2 cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="appearance-none h-5 w-5 border border-primary rounded-full  checked:bg-primary checked:border-primary cursor-pointer"
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
  // ❌ REMOVED Email state
  // const [guestEmail, setGuestEmail] = useState("");
  const [description, setDescription] = useState("");

  // UPDATED: Destructure publicHotelId from tokenStore (NEW: for logo/hotel name on public page)
  const {
    publicCategory,
    publicHotelId, // NEW: Use this instead of user.hotelId
    isPublicLoading,
    publicError,
    validateToken,
    submitPublicReview,
  } = useTokenStore();

  const {
    questions,
    answers,
    yesNoAnswerText,
    isSubmitting,
    isLoading: isQuestionsLoading,
    fetchQuestions,
    setAnswer,
    setYesNoAnswerText,
    resetReview,
  } = useReviewStore();

  const handlePhoneChange = (value: string) => {
    // 1. Remove all non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, "");
    // 2. Limit to 10 digits
    const limitedValue = numericValue.slice(0, 10);
    // 3. Update the state
    setGuestPhone(limitedValue);
  };

  // UPDATED: Determine which logo to show (FIXED: Use publicHotelId from token instead of user)
  const logoToShow = useMemo(() => {
    // Get the hotel name safely and convert to lowercase
    // We need optional chaining on .toLowerCase() as well,
    // in case 'name' itself is undefined (or the chain resolves to undefined).
    const hotelName = publicHotelId?.name?.toLowerCase(); // <-- THE FIX: Use publicHotelId

    if (hotelName?.includes("wayanad")) {
      return wayanad_logo;
    }

    // Default to Calicut logo if it's 'calicut' or if hotel is undefined
    return Calicut_logo;
  }, [publicHotelId]); // UPDATED: Depend on publicHotelId instead of user

  // 1. Validate token on mount
  useEffect(() => {
    resetReview();
    if (token) {
      validateToken(token);
    } else {
      navigate("/login"); // No token
    }
  }, [token, validateToken, navigate, resetReview]);

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
      // ... (room validation unchanged)
    }
    // 🔥 UPDATED Validation for F&B and CFC
    if (publicCategory === "f&b" || publicCategory === "cfc") {
      if (!guestName.trim()) {
        toast.error("Please enter the Guest Name.");
        return;
      }
      if (!guestPhone.trim()) {
        toast.error("Please enter the Guest Phone number.");
        return;
      }

      // ✅ --- NEW VALIDATION FOR CFC REFERRAL QUESTION ---
      if (publicCategory === "cfc") {
          const referralQuestion = questions.find(q => 
              q.questionType === 'yes_no' && 
              q.text.toLowerCase().includes("how did you hear about us")
          );
          
          // Check if the question exists and if an answer has NOT been selected
          if (referralQuestion && answers[referralQuestion._id] !== true) {
              toast.error("Please select an option for 'How did you hear about us?'.");
              return;
          }
      }
      // ✅ --- END NEW VALIDATION ---

    }
    // --- End Validation ---

    const answersPayload = Object.keys(answers)
      .filter(
        (questionId) =>
          answers[questionId] !== null && answers[questionId] !== undefined
      )
      .map((questionId) => {
        const question = questions.find((q) => q._id === questionId);
        const answer = answers[questionId];

        if (question?.questionType === "rating") {
          return { question: questionId, rating: answer as number };
        }
        if (question?.questionType === "yes_no") {
          const text = yesNoAnswerText[questionId];
          return {
            question: questionId,
            answerBoolean: answer as boolean,
            answerText: answer === true ? text : undefined,
          };
        }
        return null;
      })
      .filter(Boolean) as ReviewPayload["answers"];

    // Dynamically create the guestInfo payload
    const getGuestInfo = () => {
      if (publicCategory === "room") {
        return {
          name: guestName.trim(),
          phone: guestPhone.trim(),
          roomNumber: guestRoom.trim(),
        };
      }
      // 🔥 UPDATED GuestInfo for F&B and CFC
      if (publicCategory === "f&b" || publicCategory === "cfc") {
        return {
          name: guestName.trim(),
          phone: guestPhone.trim(),
          // ❌ REMOVED email
        };
      }
      return undefined;
    };

    const payload: ReviewPayload = {
      category: publicCategory,
      answers: answersPayload,
      description: description.trim(),
      guestInfo: getGuestInfo(),
    };

    const success = await submitPublicReview(token, payload);
    if (success) {
      toast.success("Feedback submitted successfully!");
      setPage("thankyou");
      resetReview();
    }
  };

  // UPDATED: welcomeText (FIX: Use publicHotelId instead of user)
  const welcomeText = useMemo(() => {
    const hotelName = publicHotelId?.name?.toLowerCase(); // <-- THE FIX: Use publicHotelId

    // Determine the hotel base name
    const isWayanad = hotelName?.includes("wayanad");
    const hotel = isWayanad ? "Wayanad" : "Calicut";

    // Determine the suffix based on category
    if (publicCategory === "f&b" || publicCategory === "room") {
      return `Thank you for choosing Oshin Hotels and Resorts ${hotel} , we would greatly appreciate you taking the time to complete a survey. Your evaluation of our operations will provide us the opportunity to assure that your future expectations are met and to provide you with information about new initiatives and programs.`;
    }
    if (publicCategory === "cfc") {
      // Using "Coffee Clatch" for both f&b and cfc as per your rules
      return `Thank you for experiencing Coffee Klatch ${hotel} , we would greatly appreciate you taking the time to complete a survey. Your evaluation of our operations will provide us the opportunity to assure that your future expectations are met and to provide you with information about new initiatives and programs.`;
    }

    // Fallback in case publicCategory is missing
    return `Thank you for choosing Oshin Hotels and Resorts ${hotel} , we would greatly appreciate you taking the time to complete a survey. Your evaluation of our operations will provide us the opportunity to assure that your future expectations are met and to provide you with information about new initiatives and programs.`;
  }, [publicHotelId, publicCategory]); // UPDATED: Depend on publicHotelId instead of user

  // UPDATED: thankyouNote (FIX: Use publicHotelId instead of user)
  const thankyouNote = useMemo(() => {
    const hotelName = publicHotelId?.name?.toLowerCase(); // <-- THE FIX: Use publicHotelId

    // Determine the hotel base name
    const isWayanad = hotelName?.includes("wayanad");
    const hotel = isWayanad ? "Wayanad" : "Calicut";

    // Determine the suffix based on category
    if (publicCategory === "room" || publicCategory === "f&b") {
      return `Looking forward to welcome you back for yet another Remarkable stay with Oshin Hotels and Resort ${hotel}`;
    }

    if (publicCategory === "cfc") {
      // Using "Coffee Clatch" for both f&b and cfc as per your rules
      return `Looking forward to welcoming you back for yet another experience at Coffee Klatch ${hotel}.`;
    }

    // Fallback in case publicCategory is missing
    return `Looking forward to welcome you back for yet another Remarkable stay with Oshin Hotels and Resort ${hotel}`;
  }, [publicHotelId, publicCategory]); // UPDATED: Depend on publicHotelId instead of user

  // --- Render Logic ---
  if (isPublicLoading || isQuestionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-primary animate-pulse">
          Loading Review Form...
        </p>
      </div>
    );
  }

  if (publicError && !isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-3xl font-semibold text-red-600 mb-4">
            Link Invalid
          </h2>
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
          <svg
            className="w-16 h-16 mx-auto text-green-500 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <h2 className="text-3xl font-semibold text-primary mb-4">
            Thank You!
          </h2>
          <p className="text-lg text-primary mb-8"> {thankyouNote}</p>
          {/* No "Submit Another" button for public link */}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="max-w-4xl mx-auto bg-white min-h-screen shadow-2xl flex flex-col">
        <header className="flex items-center flex-col py-5 bg-primary text-white">
          <img src={logoToShow} alt="Oshin Logo" className="w-28" />
          <div>
            <h1 className="text-3xl font-light tracking-wider">
              Oshin Hotels & Resorts
            </h1>
          </div>
        </header>

        <main className="p-8">
          {/* Intro Text */}
          <div className="mb-8 text-gray-700 space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Dear Valued Guest:
            </h2>
            {/* ✅ FIXED: Use the new welcomeText variable */}
            <p className="font-semibold pt-4 border-t border-gray-200">
              {welcomeText}
            </p>
            <p className="font-semibold pt-4 border-t border-gray-200">
              {" "}
              Please be sure to choose the option that best represents your
              opinion.{" "}
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
                      <span className="font-bold text-gray-600">
                        Outstanding
                      </span>
                      <span className="font-bold text-gray-600">
                        Unacceptable
                      </span>
                    </div>
                  </th>
                  <th className="w-[4%]"></th>
                </tr>
                <tr className=" font-semibold text-gray-600">
                  <th className="pb-2 w-2/5 text-left">
                    Please rate your experience
                  </th>
                  {[
                    "10",
                    "09",
                    "08",
                    "07",
                    "06",
                    "05",
                    "04",
                    "03",
                    "02",
                    "01",
                  ].map((num) => (
                    <th key={num} className="pb-2 font-medium w-[4%]">
                      {num}
                    </th>
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
                          key={j}
                          name={q._id}
                          value={`${ratingValue}`}
                          checked={answers[q._id] === ratingValue}
                          onChange={() => setAnswer(q._id, ratingValue)}
                        />
                      );
                    })}
                    <RadioBox
                      name={q._id}
                      value="0"
                      checked={answers[q._id] === 0}
                      onChange={() => setAnswer(q._id, 0)}
                    />
                  </tr>
                ))}
              </tbody>
              {/* Yes/No Questions Body */}
            {/* Yes/No Questions Body */}
              {yesNoQuestions.length > 0 && (
                <tbody className="border-t-2 border-gray-200 mt-4 pt-4">
                  {yesNoQuestions.map((q) => {
                    // ✅ --- START: NEW LOGIC ---
                    // Check if this is our special question (using publicCategory)
                    const isReferralQuestion = publicCategory === 'cfc' && 
                                               q.text.toLowerCase().includes("how did you hear about us");
                    
                    const referralOptions = ['Friends', 'Facebook', 'Instagram', 'Google', 'Other'];

                    return (
                        <React.Fragment key={q._id}>
                            {isReferralQuestion ? (
                                // --- RENDER OUR CUSTOM REFERRAL QUESTION ---
                                <tr className="align-middle border-t">
                                    <td className="py-2 pr-4 w-2/5">{q.text}</td>
                                    <td colSpan={11} className="py-2">
                                        <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
                                            {referralOptions.map(option => (
                                                <label key={option} className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name={q._id}
                                                        value={option}
                                                        checked={yesNoAnswerText[q._id] === option}
                                                        onChange={() => {
                                                            // Set boolean to 'true' and text to the option
                                                            setAnswer(q._id, true);
                                                            setYesNoAnswerText(q._id, option);
                                                        }}
                                                        className="appearance-none h-5 w-5 rounded-full border border-primary checked:bg-primary checked:border-primary cursor-pointer"
                                                    />
                                                    <span>{option}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                // --- RENDER A NORMAL YES/NO QUESTION (Your old logic) ---
                                <>
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

                                    {/* This block already correctly uses publicCategory */}
                                    {answers[q._id] === true &&
                                        (publicCategory === "f&b" ||
                                        publicCategory === "cfc") && (
                                        <tr className="align-middle border-b">
                                            <td className="py-2 pr-4 text-right italic text-gray-600">
                                                Please specify:
                                            </td>
                                            <td colSpan={11} className="py-2">
                                                <input
                                                    type="text"
                                                    value={yesNoAnswerText[q._id] || ""}
                                                    onChange={(e) =>
                                                        setYesNoAnswerText(q._id, e.target.value)
                                                    }
                                                    placeholder="Optional comment..."
                                                    className="w-full text-sm p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                            </td>
                                        </tr>
                                    )}
                                </>
                            )}
                        </React.Fragment>
                    )
                    // ✅ --- END: NEW LOGIC ---
                  })}
                </tbody>
              )}
            </table>
          </div>

          <section className="mt-6">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Please tell us your overall experience and in particular any
              memorable experience or exceptional associate you have encountered
              during your stay (please be specific)
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
                    label="Whats app No"
                    value={guestPhone}
                    onChange={handlePhoneChange} // ✅ UPDATED
                    type="tel"                 // ✅ ADDED
                    inputMode="numeric"        // ✅ ADDED
                    maxLength={10}             // ✅ ADDED
                  />
                  <DottedLineInput
                    label="Room No"
                    value={guestRoom}
                    onChange={setGuestRoom}
                  />
                </div>
              </div>
            )}

            {/* === F&B or CFC GUEST INFO === */}
            {/* 🔥 UPDATED: Show Name and Phone for f&b and cfc */}
            {(publicCategory === "f&b" || publicCategory === "cfc") && (
              <div className="space-y-4">
                <DottedLineInput
                  label="Guest Name"
                  value={guestName}
                  onChange={setGuestName}
                />
                <DottedLineInput
                  label="Phone"
                  value={guestPhone}
                    onChange={handlePhoneChange} // ✅ UPDATED
                    type="tel"                 // ✅ ADDED
                    inputMode="numeric"        // ✅ ADDED
                    maxLength={10}             // ✅ ADDED
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
            {publicError && <p className="text-red-500 mt-2">{publicError}</p>}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PublicReviewPage;