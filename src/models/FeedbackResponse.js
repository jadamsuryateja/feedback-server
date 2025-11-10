import mongoose from 'mongoose';

const feedbackResponseSchema = new mongoose.Schema({
  configTitle: {
    type: String,
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  branch: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  theoryFeedback: [{
    teacherName: String,
    subjectName: String,
    ratings: {
      Q1: Number,
      Q2: Number,
      Q3: Number,
      Q4: Number,
      Q5: Number,
      Q6: Number,
      Q7: Number,
      Q8: Number,
      Q9: Number,
      Q10: Number
    }
  }],
  labFeedback: [{
    labTeacherName: String,
    labName: String,
    ratings: {
      Q1: Number,
      Q2: Number,
      Q3: Number,
      Q4: Number,
      Q5: Number,
      Q6: Number,
      Q7: Number,
      Q8: Number,
      Q9: Number,
      Q10: Number
    }
  }],
  collegeComments: String,
  departmentComments: String,
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('FeedbackResponse', feedbackResponseSchema);
