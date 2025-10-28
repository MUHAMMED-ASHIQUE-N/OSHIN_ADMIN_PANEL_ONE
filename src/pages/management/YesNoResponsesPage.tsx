// src/pages/management/YesNoResponsesPage.tsx
import React, { useState, useEffect } from 'react';
// Corrected import path assuming stores is two levels up
import { useYesNoResponseStore, YesNoReviewResponse } from '../../stores/yesNoResponseStore.ts';
import { Download, AlertTriangle } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Card Component ---
const ResponseCard: React.FC<{ review: YesNoReviewResponse; category: 'room' | 'f&b' }> = ({ review, category }) => {
  const formattedDate = new Date(review.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow duration-200 flex flex-col gap-3">
       {/* Top Row: Date and Room */}
      <div className="flex justify-between items-center pb-2 border-b">
        <span className="text-sm font-medium text-gray-500">{formattedDate}</span>
        {category === 'room' && review.roomGuestInfo?.roomNumber && (
          <span className="text-sm font-semibold text-primary">Room: {review.roomGuestInfo.roomNumber}</span>
        )}
      </div>
       {/* Guest Name (if applicable) */}
       {category === 'room' && review.roomGuestInfo?.name && (
        <p className="text-base font-semibold text-gray-800">Guest: {review.roomGuestInfo.name}</p>
      )}

      {/* Map through the yesNoAnswers array */}
      <div className="space-y-3 pt-2">
        {review.yesNoAnswers.map((qaPair, index) => (
            <div key={index} className="border-b last:border-b-0 pb-2">
                {/* Question Text */}
                <p className="text-base font-medium text-gray-900">{qaPair.questionText}</p>
                {/* Answer */}
                <p className={`text-lg font-semibold ${qaPair.answer ? 'text-green-600' : 'text-red-600'}`}>
                    Answer: {qaPair.answer ? 'Yes' : 'No'}
                </p>
            </div>
        ))}
         {/* Show message if no Yes/No answers were found in this review */}
        {review.yesNoAnswers.length === 0 && !review.description && (
             <span className="italic text-gray-500 text-sm">No Yes/No answers recorded for this review.</span>
        )}
      </div>

      {/* Description (Show only if present) */}
      {review.description && (
        <div className="pt-2 border-t mt-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Overall Experience:</p>
            <p className="text-base text-gray-700 bg-gray-50 p-2 rounded border border-gray-100">
                {review.description}
            </p>
        </div>
      )}
    </div>
  );
};


// --- Main Page Component ---
const YesNoResponsesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'room' | 'f&b'>('room');
  const today = new Date();
  const priorDate = new Date(new Date().setDate(today.getDate() - 30));
  const [startDate, setStartDate] = useState<string>(priorDate.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(today.toISOString().split('T')[0]);

  const { responses, isLoading, error, fetchResponses } = useYesNoResponseStore();

  useEffect(() => {
    fetchResponses(activeTab, startDate, endDate);
  }, [activeTab, startDate, endDate, fetchResponses]);

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    const tableColumn = ["Date", "Guest Name", "Room No.", "Question", "Answer", "Description"];
    const tableRows: string[][] = [];

    doc.setFontSize(16);
    doc.text(`Yes/No Responses Report (${activeTab.toUpperCase()})`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Period: ${startDate} to ${endDate}`, 14, 20);

    responses.forEach(review => {
      const formattedDate = new Date(review.createdAt).toLocaleDateString('en-CA');
      const guestName = activeTab === 'room' ? (review.roomGuestInfo?.name || 'N/A') : 'N/A';
      const roomNum = activeTab === 'room' ? (review.roomGuestInfo?.roomNumber || 'N/A') : 'N/A';
      const description = review.description || 'N/A';

      if (review.yesNoAnswers.length > 0) {
        review.yesNoAnswers.forEach((qaPair, index) => {
           const rowData: string[] = [
               index === 0 ? formattedDate : '',
               index === 0 ? guestName : '',
               index === 0 ? roomNum : '',
               qaPair.questionText || 'N/A',
               qaPair.answer ? 'Yes' : 'No',
               index === 0 ? description : '',
           ];
           tableRows.push(rowData);
        });
      }
      // Optionally add rows for reviews with descriptions but no Yes/No answers
      // else if (review.description) {
      //    const rowData: string[] = [ formattedDate, guestName, roomNum, 'N/A', 'N/A', description ];
      //    tableRows.push(rowData);
      // }
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      theme: 'grid',
      headStyles: { fillColor: [101, 9, 51] },
      styles: { fontSize: 8 },
      columnStyles: {
           3: { cellWidth: 50 }, // Question text
           5: { cellWidth: 'auto' } // Description
       }
    });

    doc.save(`yes-no-responses_${activeTab}_${startDate}_to_${endDate}.pdf`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-[50vh] overflow-y-scroll">
      <h1 className="text-3xl font-bold text-primary mb-6">Yes/No Question Responses</h1>

      {/* Filters: Date Range and Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 p-4 bg-white rounded-lg shadow">
         {/* Date Filters */}
         <div className="flex flex-wrap items-center gap-4">
            <label className='flex items-center gap-2'>
                <span className="text-sm font-medium text-gray-700">From:</span>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    max={endDate} // Prevent start date from being after end date
                    className="p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
                />
            </label>
            <label className='flex items-center gap-2'>
                <span className="text-sm font-medium text-gray-700">To:</span>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate} // Prevent end date from being before start date
                    className="p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
                />
            </label>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-300">
          <button
            onClick={() => setActiveTab('room')}
            className={`py-2 px-6 text-base font-medium ${activeTab === 'room' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Room Responses
          </button>
          <button
            onClick={() => setActiveTab('f&b')}
            className={`py-2 px-6 text-base font-medium ${activeTab === 'f&b' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
          >
            F&B Responses
          </button>
        </div>
      </div>

       {/* Download Button */}
       <div className="flex justify-end mb-4 " >
            <button
            onClick={handleDownloadPdf}
            disabled={isLoading || responses.length === 0}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <Download size={18} />
                Download PDF
            </button>
       </div>


      {/* Content Area */}
      {isLoading ? (
        <p className="text-center text-gray-500 mt-10">Loading responses...</p>
      ) : error ? (
        <p className="text-center text-red-600 mt-10">{error}</p>
      ) : responses.length === 0 ? (
        <div className="text-center text-gray-500 mt-10 p-6 bg-white rounded-lg shadow">
             <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
             <p className="text-lg">No Yes/No responses found for the selected category and date range.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6  ">
          {responses.map((review) => (
            <ResponseCard key={review._id} review={review} category={activeTab} />
          ))}
        </div>
      )}
    </div>
  );
};

export default YesNoResponsesPage;