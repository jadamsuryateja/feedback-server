import Config from '../models/Config.js';

export const createConfig = async (req, res) => {
  try {
    const { 
      title, 
      branch,
      academicYear, 
      year, 
      semester, 
      section, 
      theorySubjects, 
      labSubjects 
    } = req.body;

    // Validate required fields
    if (!title || !branch || !academicYear || !year || !semester || !section) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: {
          title: !title ? 'Title is required' : null,
          branch: !branch ? 'Branch is required' : null,
          academicYear: !academicYear ? 'Academic Year is required' : null,
          year: !year ? 'Year is required' : null,
          semester: !semester ? 'Semester is required' : null,
          section: !section ? 'Section is required' : null
        }
      });
    }

    // Check if config with same title already exists
    const existingConfig = await Config.findOne({ title: title.toUpperCase() });
    if (existingConfig) {
      return res.status(400).json({ 
        error: 'Configuration with this title already exists' 
      });
    }

    // For BSH role, ensure branch has BSH suffix
    let branchValue = branch;
    if (req.user.role === 'bsh' && !branchValue.endsWith('-BSH')) {
      branchValue = `${branchValue}-BSH`;
    }

    const config = new Config({
      title: title.toUpperCase(),
      branch: branchValue,
      academicYear,
      year,
      semester,
      section,
      theorySubjects,
      labSubjects
    });

    const savedConfig = await config.save();
    res.status(201).json(savedConfig);
  } catch (error) {
    console.error('Error creating config:', {
      error: error.message,
      stack: error.stack,
      requestBody: {
        title,
        branch,
        academicYear,
        year,
        semester,
        section,
        userRole: req.user.role
      }
    });
    res.status(500).json({ error: 'Failed to create config: ' + error.message });
  }
};

export const getConfigs = async (req, res) => {
  try {
    const { branch, year, semester, academicYear, role } = req.query;

    let query = {};

    if (req.user.role === 'coordinator') {
      query.branch = req.user.branch;
    } else if (role === 'bsh' || req.user.role === 'bsh') {
      // For BSH users, search for branches ending with '-BSH'
      query.branch = { $regex: '-BSH$' };
    } else if (branch) {
      query.branch = branch;
    }
    if (year) query.year = parseInt(year);
    if (semester) query.semester = parseInt(semester);
    if (academicYear) query.academicYear = academicYear;

    const configs = await Config.find(query).sort({ createdAt: -1 });
    res.json(configs);
  } catch (error) {
    console.error('Get configs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getConfigByTitle = async (req, res) => {
  try {
    const { title } = req.params;
    const config = await Config.findOne({ title });

    if (!config) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    res.json(config);
  } catch (error) {
    console.error('Get config error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, ...updateData } = req.body;

    const config = await Config.findById(id);
    if (!config) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    // If title is being changed, check for duplicates
    if (title && title !== config.title) {
      const existingConfig = await Config.findOne({ 
        title: title.toUpperCase(),
        _id: { $ne: id } // Exclude current config
      });
      
      if (existingConfig) {
        return res.status(400).json({ 
          error: 'Configuration with this title already exists' 
        });
      }
    }

    // Update config
    config.title = title ? title.toUpperCase() : config.title;
    
    // Ensure BSH branch format is maintained for BSH users
    if (req.user.role === 'bsh' && updateData.branch && !updateData.branch.endsWith('-BSH')) {
      updateData.branch = `${updateData.branch}-BSH`;
    }
    
    Object.assign(config, updateData);
    config.updatedAt = Date.now();

    await config.save();
    res.json({ message: 'Configuration updated successfully', config });
  } catch (error) {
    console.error('Update config error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteConfig = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can delete configurations' });
    }

    const config = await Config.findByIdAndDelete(id);

    if (!config) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    res.json({ message: 'Configuration deleted successfully' });
  } catch (error) {
    console.error('Delete config error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
