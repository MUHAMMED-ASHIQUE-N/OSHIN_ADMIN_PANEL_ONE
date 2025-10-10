// Import your review data
import { reviewData } from "../Constant/reviewData"; // Adjust path as needed
import {  composites,questions} from '../config/reviewConfig'; // Make sure to export these
/**
 * Helper function to get the ISO week number of a date.
 * @param {Date} date - The date to process.
 * @returns {number} The ISO week number.
 */
function getWeekNumber(date) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

/**
 * Calculates overall satisfaction scores grouped by time periods.
 * "Overall Satisfaction" is the average of all question ratings.
 * @param {Array} reviews - The reviewData array.
 * @returns {Object} An object with daily, weekly, monthly, and yearly averages.
 */
export function calculateOverallSatisfaction(reviews) {
  const dailyScores = {};
  const weeklyScores = {};
  const monthlyScores = {};
  const yearlyScores = {};

  // 1. Aggregate sums and counts for each review
  for (const review of reviews) {
    const date = new Date(review.submittedAt);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const week = getWeekNumber(date).toString().padStart(2, "0");

    // Create keys for grouping
    const dailyKey = `${year}-${month}-${day}`;
    const weeklyKey = `${year}-W${week}`;
    const monthlyKey = `${year}-${month}`;
    const yearlyKey = `${year}`;

    // Calculate the total score for this single review
    const totalScore = review.answers.reduce(
      (sum, answer) => sum + answer.rating,
      0
    );
    const ratingCount = review.answers.length;

    // Helper function to update the accumulator objects
    const updateScores = (accumulator, key) => {
      if (!accumulator[key]) {
        accumulator[key] = { sum: 0, count: 0 };
      }
      accumulator[key].sum += totalScore;
      accumulator[key].count += ratingCount;
    };

    updateScores(dailyScores, dailyKey);
    updateScores(weeklyScores, weeklyKey);
    updateScores(monthlyScores, monthlyKey);
    updateScores(yearlyScores, yearlyKey);
  }

  // 2. Calculate the final average for each group
  const calculateAverages = (accumulator) => {
    const averages = {};
    for (const key in accumulator) {
      averages[key] = accumulator[key].sum / accumulator[key].count;
    }
    return averages;
  };

  return {
    daily: calculateAverages(dailyScores),
    weekly: calculateAverages(weeklyScores),
    monthly: calculateAverages(monthlyScores),
    yearly: calculateAverages(yearlyScores),
  };
}

// --- Example Usage ---
// const satisfactionScores = calculateOverallSatisfaction(reviewData);
// console.log(satisfactionScores);
// Add this function to your analytics file

export function processChartData(reviews, period, month) {
  // Logic to calculate the average for an array of reviews
  const getAverage = (reviewSubset) => {
    if (reviewSubset.length === 0) return 0;
    const totalScore = reviewSubset.reduce((sum, r) => sum + r.answers.reduce((s, a) => s + a.rating, 0), 0);
    const totalRatings = reviewSubset.reduce((sum, r) => sum + r.answers.length, 0);
    return parseFloat((totalScore / totalRatings).toFixed(2));
  };
  
  switch (period) {
    case 'Yearly':
      const yearAvg = getAverage(reviews);
      return [{ name: 'Overall', value: yearAvg }];

    case 'Monthly':
      const monthlyResult = [];
      for (let i = 0; i < 12; i++) {
        const monthReviews = reviews.filter(r => new Date(r.submittedAt).getMonth() === i);
        const monthAvg = getAverage(monthReviews);
        const monthName = new Date(0, i).toLocaleString('default', { month: 'short' });
        monthlyResult.push({ name: monthName, value: monthAvg });
      }
      return monthlyResult;

    case 'Weekly':
      // Filter for the specific month selected
      const relevantMonthReviews = reviews.filter(r => new Date(r.submittedAt).getMonth() === month);
      const weeklyResult = {}; // e.g., { 1: [reviews], 2: [reviews] }

      for (const review of relevantMonthReviews) {
        const dayOfMonth = new Date(review.submittedAt).getDate();
        // Simple weekly bucketing: 1-7 is Week 1, 8-14 is Week 2, etc.
        const weekOfMonth = Math.ceil(dayOfMonth / 7);
        if (!weeklyResult[weekOfMonth]) weeklyResult[weekOfMonth] = [];
        weeklyResult[weekOfMonth].push(review);
      }
      
      // Convert the grouped reviews into final averages
      return Object.entries(weeklyResult).map(([week, weekReviews]) => ({
          name: `W${week}`,
          value: getAverage(weekReviews)
      }));

    default:
      return [];
  }
}



// This function calculates the main chart data (bar, line) for a specific composite
export function calculateCompositeData(reviews, compositeName, period, month) {
  const composite = composites.find(c => c.name === compositeName);
  if (!composite) return [];
  const relevantQuestionIds = composite.questionIds;

  const getCompositeAverage = (reviewSubset) => {
    if (reviewSubset.length === 0) return 0;
    let totalScore = 0;
    let totalRatings = 0;
    for (const review of reviewSubset) {
      for (const answer of review.answers) {
        if (relevantQuestionIds.includes(answer.questionId)) {
          totalScore += answer.rating;
          totalRatings++;
        }
      }
    }
    return totalRatings > 0 ? parseFloat((totalScore / totalRatings).toFixed(2)) : 0;
  };
  
  switch (period) {
    case 'Yearly':
      return [{ name: 'Overall', value: getCompositeAverage(reviews) }];
    case 'Monthly':
      const monthlyResult = [];
      for (let i = 0; i < 12; i++) {
        const monthReviews = reviews.filter(r => new Date(r.submittedAt).getMonth() === i);
        const monthName = new Date(0, i).toLocaleString('default', { month: 'short' });
        monthlyResult.push({ name: monthName, value: getCompositeAverage(monthReviews) });
      }
      return monthlyResult;
    case 'Weekly':
      // ✅ FIXED: Added the missing calculation and return statement
      const relevantMonthReviews = reviews.filter(r => new Date(r.submittedAt).getMonth() === month);
      const weeklyResult = {};

      for (const review of relevantMonthReviews) {
        const dayOfMonth = new Date(review.submittedAt).getDate();
        const weekOfMonth = Math.ceil(dayOfMonth / 7);
        if (!weeklyResult[weekOfMonth]) weeklyResult[weekOfMonth] = [];
        weeklyResult[weekOfMonth].push(review);
      }
      
      return Object.entries(weeklyResult).map(([week, weekReviews]) => ({
          name: `W${week}`,
          value: getCompositeAverage(weekReviews)
      }));
  }
  return [];
}


// This NEW function calculates the overall average for individual questions (for the side pie charts)
export function calculateQuestionAverages(reviews, compositeName) {
    const composite = composites.find(c => c.name === compositeName);
    if (!composite) return [];

    const results = composite.questionIds.map(qId => {
        const question = questions.find(q => q.id === qId);
        let totalScore = 0;
        let totalRatings = 0;

        for (const review of reviews) {
            const answer = review.answers.find(a => a.questionId === qId);
            if (answer) {
                totalScore += answer.rating;
                totalRatings++;
            }
        }

        const average = totalRatings > 0 ? parseFloat((totalScore / totalRatings).toFixed(2)) : 0;
        
        // Data for the small donut charts (value is out of 10)
        return {
            name: question.text ,// Use a shorter name like "OSAT", "Return"
            value: average,
        };
    });

    return results;
}