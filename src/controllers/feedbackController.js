import FeedbackResponse from '../models/FeedbackResponse.js';
import Config from '../models/Config.js';

export const submitFeedback = async (req, res) => {
  try {
    const { configTitle, theoryFeedback, labFeedback, collegeComments, departmentComments } = req.body;

    if (!configTitle) {
      return res.status(400).json({ error: 'Config title is required' });
    }

    // Get the configuration to extract academic info
    const config = await Config.findOne({ title: configTitle });
    if (!config) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    const feedbackResponse = new FeedbackResponse({
      configTitle,
      // Add academic info from the config
      academicYear: config.academicYear,
      year: config.year,
      semester: config.semester,
      branch: config.branch,
      section: config.section,
      // Feedback data
      theoryFeedback: theoryFeedback || [],
      labFeedback: labFeedback || [],
      collegeComments: collegeComments || '',
      departmentComments: departmentComments || ''
    });

    await feedbackResponse.save();
    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getFeedbackSummary = async (req, res) => {
  try {
    const { academicYear, year, semester, branch, section } = req.query;

    let query = {};
    
    // Add filters based on query parameters
    if (academicYear) query.academicYear = academicYear;
    if (year) query.year = parseInt(year);
    if (semester) query.semester = parseInt(semester);
    if (branch) query.branch = branch;
    if (section) query.section = section;

    const feedbacks = await FeedbackResponse.find(query);

    const summary = {};
    const allComments = [];

    feedbacks.forEach(feedback => {
      feedback.theoryFeedback.forEach(theory => {
        const key = `${theory.teacherName}_${theory.subjectName}`;
        if (!summary[key]) {
          summary[key] = {
            teacherName: theory.teacherName,
            subjectName: theory.subjectName,
            type: 'Theory',
            totalResponses: 0,
            questions: {
              Q1: { ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
              Q2: { ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
              Q3: { ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
              Q4: { ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
              Q5: { ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
              Q6: { ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
              Q7: { ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
              Q8: { ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
              Q9: { ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
              Q10: { ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
            }
          };
        }

        summary[key].totalResponses++;
        Object.keys(theory.ratings).forEach(q => {
          const rating = theory.ratings[q];
          if (rating >= 1 && rating <= 5) {
            summary[key].questions[q].ratingCounts[rating]++;
          }
        });
      });

      feedback.labFeedback.forEach(lab => {
        const key = `${lab.labTeacherName}_${lab.labName}`;
        if (!summary[key]) {
          summary[key] = {
            teacherName: lab.labTeacherName,
            subjectName: lab.labName,
            type: 'Lab',
            totalResponses: 0,
            questions: {
              Q1: { ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
              Q2: { ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
              Q3: { ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
              Q4: { ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
              Q5: { ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
              Q6: { ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
              Q7: { ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
              Q8: { ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
              Q9: { ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
              Q10: { ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
            }
          };
        }

        summary[key].totalResponses++;
        Object.keys(lab.ratings).forEach(q => {
          const rating = lab.ratings[q];
          if (rating >= 1 && rating <= 5) {
            summary[key].questions[q].ratingCounts[rating]++;
          }
        });
      });

      if (feedback.collegeComments || feedback.departmentComments) {
        allComments.push({
          collegeComments: feedback.collegeComments,
          departmentComments: feedback.departmentComments,
          submittedAt: feedback.submittedAt
        });
      }
    });

    const summaryArray = Object.values(summary).map(item => {
      const questionScores = {};
      let totalWeightedSum = 0;
      let totalMaxScore = 0;

      Object.keys(item.questions).forEach(q => {
        const ratingCounts = item.questions[q].ratingCounts;

        let weightedSum = 0;
        for (let rating = 1; rating <= 5; rating++) {
          weightedSum += ratingCounts[rating] * rating;
        }

        const maxScore = item.totalResponses * 5;
        const percentage = maxScore > 0 ? ((weightedSum / maxScore) * 100).toFixed(2) : '0.00';

        questionScores[q] = {
          score: weightedSum,
          percentage: percentage,
          ratingCounts: ratingCounts
        };

        totalWeightedSum += weightedSum;
        totalMaxScore += maxScore;
      });

      const overallPercentage = totalMaxScore > 0
        ? ((totalWeightedSum / totalMaxScore) * 100).toFixed(2)
        : '0.00';

      return {
        teacherName: item.teacherName,
        subjectName: item.subjectName,
        type: item.type,
        totalResponses: item.totalResponses,
        questionScores,
        overallPercentage
      };
    });

    res.json({
      summary: summaryArray,
      comments: allComments,
      filterInfo: {
        academicYear: academicYear || 'All',
        year: year || 'All',
        semester: semester || 'All',
        branch: branch || 'All',
        section: section || 'All'
      }
    });
  } catch (error) {
    console.error('Get feedback summary error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getFeedbackResponses = async (req, res) => {
  try {
    const { academicYear, year, semester, branch, section } = req.query;

    let query = {};
    
    // Add filters based on query parameters
    if (academicYear) query.academicYear = academicYear;
    if (year) query.year = parseInt(year);
    if (semester) query.semester = parseInt(semester);
    if (branch) query.branch = branch;
    if (section) query.section = section;

    const feedbacks = await FeedbackResponse.find(query)
      .sort({ submittedAt: -1 });

    res.json(feedbacks);
  } catch (error) {
    console.error('Get feedback responses error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
