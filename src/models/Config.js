import mongoose from 'mongoose';

const theorySubjectSchema = new mongoose.Schema({
  teacherName: { type: String, required: true },
  subjectName: { type: String, required: true }
});

const labSubjectSchema = new mongoose.Schema({
  labTeacherName: { type: String, required: true },
  labName: { type: String, required: true }
});

const configSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  branch: { type: String, required: true },
  academicYear: { type: String, required: true },
  year: { type: Number, required: true },
  semester: { type: Number, required: true },
  section: { type: String, required: true },      // Make sure this exists
  theorySubjects: [theorySubjectSchema],
  labSubjects: [labSubjectSchema]
}, {
  timestamps: true
});

export default mongoose.model('Config', configSchema);
