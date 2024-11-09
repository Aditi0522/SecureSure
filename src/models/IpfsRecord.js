const mongoose = require('mongoose');

const ipfsRecordSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    index: true
  },
  records: [{
    type: {
      type: String,
      enum: ['form', 'document'],
      required: true
    },
    documentType: {
      type: String,
      enum: ['bills', 'doctorReports', 'testReports', 'policyDocuments'],
      required: function() { return this.type === 'document'; }
    },
    name: String,
    ipfsHash: {
      type: String,
      required: true
    },
    ipfsUrl: String,
    size: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

const IpfsRecord = mongoose.model('IpfsRecord', ipfsRecordSchema);
module.exports = IpfsRecord;