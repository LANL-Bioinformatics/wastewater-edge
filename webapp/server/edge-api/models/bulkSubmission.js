const mongoose = require('mongoose')
const { bulkSubmissionStatus } = require('../utils/conf')

// Create Schema
const bulkSubmissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    desc: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      default: bulkSubmissionStatus[0],
      enum: bulkSubmissionStatus,
    },
    type: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    public: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: String,
      required: true,
    },
    jobPriority: {
      type: Number,
      default: 0,
    },
    sharedTo: [
      {
        type: String,
      },
    ],
    projects: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: {
      createdAt: 'created', // Use `created` to store the created date
      updatedAt: 'updated', // and `updated` to store the last updated date
    },
  },
)

module.exports = mongoose.model('BulkSubmission', bulkSubmissionSchema)
