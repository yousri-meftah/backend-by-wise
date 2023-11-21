/**
 * EventController.js
 * @description : exports action methods for Event.
 */

const Event = require('../../../model/Event');
const EventSchemaKey = require('../../../utils/validation/EventValidation');
const validation = require('../../../utils/validateRequest');
const dbService = require('../../../utils/dbService');
const ObjectId = require('mongodb').ObjectId;
const utils = require('../../../utils/common');
   
/**
 * @description : create document of Event in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Event. {status, message, data}
 */ 
const addEvent = async (req, res) => {
  try {
    let dataToCreate = { ...req.body || {} };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      EventSchemaKey.schemaKeys);
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    }
    dataToCreate.addedBy = req.user.id;
    dataToCreate = new Event(dataToCreate);
    let createdEvent = await dbService.create(Event,dataToCreate);
    return res.success({ data : createdEvent });
  } catch (error) {
    return res.internalServerError({ message:error.message }); 
  }
};
    
/**
 * @description : create multiple documents of Event in mongodb collection.
 * @param {Object} req : request including body for creating documents.
 * @param {Object} res : response of created documents.
 * @return {Object} : created Events. {status, message, data}
 */
const bulkInsertEvent = async (req,res)=>{
  try {
    if (req.body && (!Array.isArray(req.body.data) || req.body.data.length < 1)) {
      return res.badRequest();
    }
    let dataToCreate = [ ...req.body.data ];
    for (let i = 0;i < dataToCreate.length;i++){
      dataToCreate[i] = {
        ...dataToCreate[i],
        addedBy: req.user.id
      };
    }
    let createdEvents = await dbService.create(Event,dataToCreate);
    createdEvents = { count: createdEvents ? createdEvents.length : 0 };
    return res.success({ data:{ count:createdEvents.count || 0 } });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};
    
/**
 * @description : find all documents of Event from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Event(s). {status, message, data}
 */
const findAllEvent = async (req,res) => {
  try {
    let options = {};
    let query = {};
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      EventSchemaKey.findFilterKeys,
      Event.schema.obj
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.query === 'object' && req.body.query !== null) {
      query = { ...req.body.query };
    }
    if (req.body.isCountOnly){
      let totalRecords = await dbService.count(Event, query);
      return res.success({ data: { totalRecords } });
    }
    if (req.body && typeof req.body.options === 'object' && req.body.options !== null) {
      options = { ...req.body.options };
    }
    let foundEvents = await dbService.paginate( Event,query,options);
    if (!foundEvents || !foundEvents.data || !foundEvents.data.length){
      return res.recordNotFound(); 
    }
    return res.success({ data :foundEvents });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};
        
/**
 * @description : find document of Event from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found Event. {status, message, data}
 */
const getEvent = async (req,res) => {
  try {
    let query = {};
    if (!ObjectId.isValid(req.params.id)) {
      return res.validationError({ message : 'invalid objectId.' });
    }
    query._id = req.params.id;
    let options = {};
    let foundEvent = await dbService.findOne(Event,query, options);
    if (!foundEvent){
      return res.recordNotFound();
    }
    return res.success({ data :foundEvent });
  }
  catch (error){
    return res.internalServerError({ message:error.message });
  }
};
    
/**
 * @description : returns total number of documents of Event.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getEventCount = async (req,res) => {
  try {
    let where = {};
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      EventSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.where === 'object' && req.body.where !== null) {
      where = { ...req.body.where };
    }
    let countedEvent = await dbService.count(Event,where);
    return res.success({ data : { count: countedEvent } });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};
    
/**
 * @description : update document of Event with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Event.
 * @return {Object} : updated Event. {status, message, data}
 */
const updateEvent = async (req,res) => {
  try {
    let dataToUpdate = {
      ...req.body,
      updatedBy:req.user.id,
    };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      EventSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    }
    const query = { _id:req.params.id };
    let updatedEvent = await dbService.updateOne(Event,query,dataToUpdate);
    if (!updatedEvent){
      return res.recordNotFound();
    }
    return res.success({ data :updatedEvent });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};

/**
 * @description : update multiple records of Event with data by filter.
 * @param {Object} req : request including filter and data in request body.
 * @param {Object} res : response of updated Events.
 * @return {Object} : updated Events. {status, message, data}
 */
const bulkUpdateEvent = async (req,res)=>{
  try {
    let filter = req.body && req.body.filter ? { ...req.body.filter } : {};
    let dataToUpdate = {};
    delete dataToUpdate['addedBy'];
    if (req.body && typeof req.body.data === 'object' && req.body.data !== null) {
      dataToUpdate = { 
        ...req.body.data,
        updatedBy : req.user.id
      };
    }
    let updatedEvent = await dbService.updateMany(Event,filter,dataToUpdate);
    if (!updatedEvent){
      return res.recordNotFound();
    }
    return res.success({ data :{ count : updatedEvent } });
  } catch (error){
    return res.internalServerError({ message:error.message }); 
  }
};
    
/**
 * @description : partially update document of Event with data by id;
 * @param {obj} req : request including id in request params and data in request body.
 * @param {obj} res : response of updated Event.
 * @return {obj} : updated Event. {status, message, data}
 */
const partialUpdateEvent = async (req,res) => {
  try {
    if (!req.params.id){
      res.badRequest({ message : 'Insufficient request parameters! id is required.' });
    }
    delete req.body['addedBy'];
    let dataToUpdate = {
      ...req.body,
      updatedBy:req.user.id,
    };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      EventSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    }
    const query = { _id:req.params.id };
    let updatedEvent = await dbService.updateOne(Event, query, dataToUpdate);
    if (!updatedEvent) {
      return res.recordNotFound();
    }
    return res.success({ data:updatedEvent });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};
/**
 * @description : deactivate document of Event from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated document of Event.
 * @return {Object} : deactivated Event. {status, message, data}
 */
const softDeleteEvent = async (req,res) => {
  try {
    if (!req.params.id){
      return res.badRequest({ message : 'Insufficient request parameters! id is required.' });
    }
    let query = { _id:req.params.id };
    const updateBody = {
      isDeleted: true,
      updatedBy: req.user.id,
    };
    let updatedEvent = await dbService.updateOne(Event, query, updateBody);
    if (!updatedEvent){
      return res.recordNotFound();
    }
    return res.success({ data:updatedEvent });
  } catch (error){
    return res.internalServerError({ message:error.message }); 
  }
};

/**
 * @description : delete document of Event from table.
 * @param {Object} req : request including id as req param.
 * @param {Object} res : response contains deleted document.
 * @return {Object} : deleted Event. {status, message, data}
 */
const deleteEvent = async (req,res) => {
  try { 
    if (!req.params.id){
      return res.badRequest({ message : 'Insufficient request parameters! id is required.' });
    }
    const query = { _id:req.params.id };
    const deletedEvent = await dbService.deleteOne(Event, query);
    if (!deletedEvent){
      return res.recordNotFound();
    }
    return res.success({ data :deletedEvent });
        
  }
  catch (error){
    return res.internalServerError({ message:error.message });
  }
};
    
/**
 * @description : delete documents of Event in table by using ids.
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains no of documents deleted.
 * @return {Object} : no of documents deleted. {status, message, data}
 */
const deleteManyEvent = async (req, res) => {
  try {
    let ids = req.body.ids;
    if (!ids || !Array.isArray(ids) || ids.length < 1) {
      return res.badRequest();
    }
    const query = { _id:{ $in:ids } };
    const deletedEvent = await dbService.deleteMany(Event,query);
    if (!deletedEvent){
      return res.recordNotFound();
    }
    return res.success({ data :{ count :deletedEvent } });
  } catch (error){
    return res.internalServerError({ message:error.message }); 
  }
};
/**
 * @description : deactivate multiple documents of Event from table by ids;
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains updated documents of Event.
 * @return {Object} : number of deactivated documents of Event. {status, message, data}
 */
const softDeleteManyEvent = async (req,res) => {
  try {
    let ids = req.body.ids;
    if (!ids || !Array.isArray(ids) || ids.length < 1) {
      return res.badRequest();
    }
    const query = { _id:{ $in:ids } };
    const updateBody = {
      isDeleted: true,
      updatedBy: req.user.id,
    };
    let updatedEvent = await dbService.updateMany(Event,query, updateBody);
    if (!updatedEvent) {
      return res.recordNotFound();
    }
    return res.success({ data:{ count :updatedEvent } });
        
  } catch (error){
    return res.internalServerError({ message:error.message }); 
  }
};

module.exports = {
  addEvent,
  bulkInsertEvent,
  findAllEvent,
  getEvent,
  getEventCount,
  updateEvent,
  bulkUpdateEvent,
  partialUpdateEvent,
  softDeleteEvent,
  deleteEvent,
  deleteManyEvent,
  softDeleteManyEvent    
};