import React, { useState, useEffect } from 'react';
// Corrected import path assuming stores is two levels up
import { useGuestIssuesStore, GuestIssue } from '../../stores/guestIssuesStore';
import { Download, AlertTriangle } from 'lucide-react';
import jsPDF from 'jspdf';
// Changed import style for jspdf-autotable
import autoTable from 'jspdf-autotable';


// --- Reusable Issue Card Component ---
const IssueCard: React.FC<{ issue: GuestIssue; category: 'room' | 'f&b' }> = ({ issue, category }) => {
  const formattedDate = new Date(issue.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-center mb-2 pb-2 border-b">
        <span className="text-sm font-medium text-gray-500">{formattedDate}</span>
        {category === 'room' && issue.roomGuestInfo?.roomNumber && (
          <span className="text-sm font-semibold text-primary">Room: {issue.roomGuestInfo.roomNumber}</span>
        )}
      </div>
      {category === 'room' && issue.roomGuestInfo?.name && (
        <p className="text-base font-semibold text-gray-800 mb-1">Guest: {issue.roomGuestInfo.name}</p>
      )}
      {/* <p className="text-sm text-gray-600 mb-3">Trigger: [Question Text Here]</p> */}
      <p className="text-base text-gray-700 bg-gray-50 p-2 rounded border border-gray-100">{issue.description || <span className="italic text-gray-500">No description provided.</span>}</p>
    </div>
  );
};


// --- Main Page Component ---
const GuestIssuesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'room' | 'f&b'>('room');
  const today = new Date();
  const priorDate = new Date(new Date().setDate(today.getDate() - 30));
  const [startDate, setStartDate] = useState<string>(priorDate.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(today.toISOString().split('T')[0]);

  const { issues, isLoading, error, fetchIssues } = useGuestIssuesStore();

  useEffect(() => {
    fetchIssues(activeTab, startDate, endDate);
  }, [activeTab, startDate, endDate, fetchIssues]);

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    const tableColumn = ["Date", "Description", "Guest Name", "Room No."];
    // const tableRows: (string | undefined)[][] = [];
    const tableRows: string[][] = [];

    // Title
    doc.setFontSize(16);
    doc.text(`Guest Issues Report (${activeTab.toUpperCase()})`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Period: ${startDate} to ${endDate}`, 14, 20);


    issues.forEach(issue => {
      const formattedDate = new Date(issue.createdAt).toLocaleDateString('en-CA'); // YYYY-MM-DD
      const issueData = [
        formattedDate,
        issue.description || 'N/A',
        activeTab === 'room' ? issue.roomGuestInfo?.name || 'N/A' : 'N/A',
        activeTab === 'room' ? issue.roomGuestInfo?.roomNumber || 'N/A' : 'N/A',
      ];
      tableRows.push(issueData);
    });

    // Call autoTable as a function, passing the doc instance
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      theme: 'grid',
      headStyles: { fillColor: [101, 9, 51] }, // Primary color RGB
      styles: { fontSize: 8 },
    });

    doc.save(`guest_issues_${activeTab}_${startDate}_to_${endDate}.pdf`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <h1 className="text-3xl font-bold text-primary mb-6">Guest Issues / Problems</h1>

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
                    className="p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary text-sm"
                />
            </label>
            <label className='flex items-center gap-2'>
                <span className="text-sm font-medium text-gray-700">To:</span>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
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
            Room Issues
          </button>
          <button
            onClick={() => setActiveTab('f&b')}
            className={`py-2 px-6 text-base font-medium ${activeTab === 'f&b' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
          >
            F&B Issues
          </button>
        </div>
      </div>

       {/* Download Button */}
       <div className="flex justify-end mb-4">
            <button
            onClick={handleDownloadPdf}
            disabled={isLoading || issues.length === 0}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <Download size={18} />
                Download PDF
            </button>
       </div>


      {/* Content Area */}
      {isLoading ? (
        <p className="text-center text-gray-500 mt-10">Loading issues...</p>
      ) : error ? (
        <p className="text-center text-red-600 mt-10">{error}</p>
      ) : issues.length === 0 ? (
        <div className="text-center text-gray-500 mt-10 p-6 bg-white rounded-lg shadow">
             <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
             <p className="text-lg">No issues reported for the selected category and date range.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {issues.map(issue => (
            <IssueCard key={issue._id} issue={issue} category={activeTab} />
          ))}
        </div>
      )}
    </div>
  );
};

export default GuestIssuesPage;