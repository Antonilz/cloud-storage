const mongoose = require('mongoose');

/**
 * Item Tag Schema
 * @private
 */
const TagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
      unique: true
    }
  },
  {
    toJSON: {
      virtuals: true,
      transform: function(doc, ret) {
        delete ret._id;
        delete ret.__v;
      }
    }
  }
);

TagSchema.method({
  transform() {
    const transformed = {};
    const fields = ['id', 'name'];

    fields.forEach(field => {
      transformed[field] = this[field];
    });

    return transformed;
  }
});

TagSchema.statics = {
  async getTagsByName(queryName) {
    const nameRegEx = new RegExp(
      queryName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'),
      'g'
    );
    return await this.find({ name: { $regex: nameRegEx } }).limit(10);
  }
};

module.exports = mongoose.model('tags', TagSchema);
