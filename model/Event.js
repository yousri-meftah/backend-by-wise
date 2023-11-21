/**
 * Event.js
 * @description :: model of a database collection Event
 */

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
let idValidator = require('mongoose-id-validator');
const myCustomLabels = {
  totalDocs: 'itemCount',
  docs: 'data',
  limit: 'perPage',
  page: 'currentPage',
  nextPage: 'next',
  prevPage: 'prev',
  totalPages: 'pageCount',
  pagingCounter: 'slNo',
  meta: 'paginator',
};
mongoosePaginate.paginate.options = { customLabels: myCustomLabels };
const Schema = mongoose.Schema;
const schema = new Schema(
  {

    name:{ type:String },

    description:{ type:String },

    address:{
      line1:{ type:String },
      line2:{ type:String },
      city:{ type:String },
      country:{ type:String },
      state:{ type:String },
      pincode:{ type:String },
      lat:{ type:Number },
      lng:{ type:Number }
    },

    startDateTime:{ type:Date },

    endDateTime:{ type:Date },

    speakers:[{
      name:{ type:String },
      image:{ type:String },
      email:{ type:String }
    }],

    organizer:{
      name:{ type:String },
      image:{ type:String },
      email:{ type:String },
      url:{ type:String }
    },

    image:{ type:String },

    attachments:{ type:Array },

    isActive:{ type:Boolean },

    createdAt:{ type:Date },

    updatedAt:{ type:Date },

    updatedBy:{
      type:Schema.Types.ObjectId,
      ref:'user'
    },

    addedBy:{
      type:Schema.Types.ObjectId,
      ref:'user'
    },

    isDeleted:{ type:Boolean }
  }
  ,{ 
    timestamps: { 
      createdAt: 'createdAt', 
      updatedAt: 'updatedAt' 
    } 
  }
);
schema.index({ 'name':1 },{ 'name':'index_name' });
schema.pre('save', async function (next) {
  this.isDeleted = false;
  this.isActive = true;
  next();
});

schema.pre('insertMany', async function (next, docs) {
  if (docs && docs.length){
    for (let index = 0; index < docs.length; index++) {
      const element = docs[index];
      element.isDeleted = false;
      element.isActive = true;
    }
  }
  next();
});

schema.method('toJSON', function () {
  const {
    _id, __v, ...object 
  } = this.toObject({ virtuals:true });
  object.id = _id;
     
  return object;
});
schema.plugin(mongoosePaginate);
schema.plugin(idValidator);
const Event = mongoose.model('Event',schema);
module.exports = Event;