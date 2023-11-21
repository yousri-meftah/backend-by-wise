/**
 * MasterController.js
 * @description : exports action methods for Master.
 */

const Master = require('../../../model/Master');
const MasterSchemaKey = require('../../../utils/validation/MasterValidation');
const validation = require('../../../utils/validateRequest');
const dbService = require('../../../utils/dbService');
const ObjectId = require('mongodb').ObjectId;
const deleteDependentService = require('../../../utils/deleteDependent');
const utils = require('../../../utils/common');
   
/**
 * @description : create document of Master in mongodb collection.
 * @param {Object} req : request including body for creating document.
 * @param {Object} res : response of created document
 * @return {Object} : created Master. {status, message, data}
 */ 
const addMaster = async (req, res) => {
  try {
    let dataToCreate = { ...req.body || {} };
    let validateRequest = validation.validateParamsWithJoi(
      dataToCreate,
      MasterSchemaKey.schemaKeys);
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    }
    dataToCreate.addedBy = req.user.id;
    dataToCreate = new Master(dataToCreate);
    let createdMaster = await dbService.create(Master,dataToCreate);
    return res.success({ data : createdMaster });
  } catch (error) {
    return res.internalServerError({ message:error.message }); 
  }
};
    
/**
 * @description : create multiple documents of Master in mongodb collection.
 * @param {Object} req : request including body for creating documents.
 * @param {Object} res : response of created documents.
 * @return {Object} : created Masters. {status, message, data}
 */
const bulkInsertMaster = async (req,res)=>{
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
    let createdMasters = await dbService.create(Master,dataToCreate);
    createdMasters = { count: createdMasters ? createdMasters.length : 0 };
    return res.success({ data:{ count:createdMasters.count || 0 } });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};
    
/**
 * @description : find all documents of Master from collection based on query and options.
 * @param {Object} req : request including option and query. {query, options : {page, limit, pagination, populate}, isCountOnly}
 * @param {Object} res : response contains data found from collection.
 * @return {Object} : found Master(s). {status, message, data}
 */
const findAllMaster = async (req,res) => {
  try {
    let options = {};
    let query = {};
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      MasterSchemaKey.findFilterKeys,
      Master.schema.obj
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.query === 'object' && req.body.query !== null) {
      query = { ...req.body.query };
    }
    if (req.body.isCountOnly){
      let totalRecords = await dbService.count(Master, query);
      return res.success({ data: { totalRecords } });
    }
    if (req.body && typeof req.body.options === 'object' && req.body.options !== null) {
      options = { ...req.body.options };
    }
    let foundMasters = await dbService.paginate( Master,query,options);
    if (!foundMasters || !foundMasters.data || !foundMasters.data.length){
      return res.recordNotFound(); 
    }
    return res.success({ data :foundMasters });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};
        
/**
 * @description : find document of Master from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains document retrieved from table.
 * @return {Object} : found Master. {status, message, data}
 */
const getMaster = async (req,res) => {
  try {
    let query = {};
    if (!ObjectId.isValid(req.params.id)) {
      return res.validationError({ message : 'invalid objectId.' });
    }
    query._id = req.params.id;
    let options = {};
    let foundMaster = await dbService.findOne(Master,query, options);
    if (!foundMaster){
      return res.recordNotFound();
    }
    return res.success({ data :foundMaster });
  }
  catch (error){
    return res.internalServerError({ message:error.message });
  }
};
    
/**
 * @description : returns total number of documents of Master.
 * @param {Object} req : request including where object to apply filters in req body 
 * @param {Object} res : response that returns total number of documents.
 * @return {Object} : number of documents. {status, message, data}
 */
const getMasterCount = async (req,res) => {
  try {
    let where = {};
    let validateRequest = validation.validateFilterWithJoi(
      req.body,
      MasterSchemaKey.findFilterKeys,
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message: `${validateRequest.message}` });
    }
    if (typeof req.body.where === 'object' && req.body.where !== null) {
      where = { ...req.body.where };
    }
    let countedMaster = await dbService.count(Master,where);
    return res.success({ data : { count: countedMaster } });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};
    
/**
 * @description : update document of Master with data by id.
 * @param {Object} req : request including id in request params and data in request body.
 * @param {Object} res : response of updated Master.
 * @return {Object} : updated Master. {status, message, data}
 */
const updateMaster = async (req,res) => {
  try {
    let dataToUpdate = {
      ...req.body,
      updatedBy:req.user.id,
    };
    let validateRequest = validation.validateParamsWithJoi(
      dataToUpdate,
      MasterSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    }
    const query = { _id:req.params.id };
    let updatedMaster = await dbService.updateOne(Master,query,dataToUpdate);
    if (!updatedMaster){
      return res.recordNotFound();
    }
    return res.success({ data :updatedMaster });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};

/**
 * @description : update multiple records of Master with data by filter.
 * @param {Object} req : request including filter and data in request body.
 * @param {Object} res : response of updated Masters.
 * @return {Object} : updated Masters. {status, message, data}
 */
const bulkUpdateMaster = async (req,res)=>{
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
    let updatedMaster = await dbService.updateMany(Master,filter,dataToUpdate);
    if (!updatedMaster){
      return res.recordNotFound();
    }
    return res.success({ data :{ count : updatedMaster } });
  } catch (error){
    return res.internalServerError({ message:error.message }); 
  }
};
    
/**
 * @description : partially update document of Master with data by id;
 * @param {obj} req : request including id in request params and data in request body.
 * @param {obj} res : response of updated Master.
 * @return {obj} : updated Master. {status, message, data}
 */
const partialUpdateMaster = async (req,res) => {
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
      MasterSchemaKey.updateSchemaKeys
    );
    if (!validateRequest.isValid) {
      return res.validationError({ message : `Invalid values in parameters, ${validateRequest.message}` });
    }
    const query = { _id:req.params.id };
    let updatedMaster = await dbService.updateOne(Master, query, dataToUpdate);
    if (!updatedMaster) {
      return res.recordNotFound();
    }
    return res.success({ data:updatedMaster });
  } catch (error){
    return res.internalServerError({ message:error.message });
  }
};
    
/**
 * @description : deactivate document of Master from table by id;
 * @param {Object} req : request including id in request params.
 * @param {Object} res : response contains updated document of Master.
 * @return {Object} : deactivated Master. {status, message, data}
 */
const softDeleteMaster = async (req,res) => {
  try {
    if (!req.params.id){
      return res.badRequest({ message : 'Insufficient request parameters! id is required.' });
    }
    const query = { _id:req.params.id };
    const updateBody = {
      isDeleted: true,
      updatedBy: req.user.id,
    };
    let updatedMaster = await deleteDependentService.softDeleteMaster(query, updateBody);
    if (!updatedMaster){
      return res.recordNotFound();
    }
    return res.success({ data:updatedMaster });
  } catch (error){
    return res.internalServerError({ message:error.message }); 
  }
};
    
/**
 * @description : delete document of Master from table.
 * @param {Object} req : request including id as req param.
 * @param {Object} res : response contains deleted document.
 * @return {Object} : deleted Master. {status, message, data}
 */
const deleteMaster = async (req,res) => {
  try {
    if (!req.params.id){
      return res.badRequest({ message : 'Insufficient request parameters! id is required.' });
    }
    const query = { _id:req.params.id };
    let deletedMaster;
    if (req.body.isWarning) { 
      deletedMaster = await deleteDependentService.countMaster(query);
    } else {
      deletedMaster = await deleteDependentService.deleteMaster(query);
    }
    if (!deletedMaster){
      return res.recordNotFound();
    }
    return res.success({ data :deletedMaster });
  }
  catch (error){
    return res.internalServerError({ message:error.message }); 
  }
};
    
/**
 * @description : delete documents of Master in table by using ids.
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains no of documents deleted.
 * @return {Object} : no of documents deleted. {status, message, data}
 */
const deleteManyMaster = async (req, res) => {
  try {
    let ids = req.body.ids;
    if (!ids || !Array.isArray(ids) || ids.length < 1) {
      return res.badRequest();
    }
    const query = { _id:{ $in:ids } };
    let deletedMaster;
    if (req.body.isWarning) {
      deletedMaster = await deleteDependentService.countMaster(query);
    }
    else {
      deletedMaster = await deleteDependentService.deleteMaster(query);
    }
    if (!deletedMaster){
      return res.recordNotFound();
    }
    return res.success({ data :deletedMaster });
  } catch (error){
    return res.internalServerError({ message:error.message }); 
  }
};
    
/**
 * @description : deactivate multiple documents of Master from table by ids;
 * @param {Object} req : request including array of ids in request body.
 * @param {Object} res : response contains updated documents of Master.
 * @return {Object} : number of deactivated documents of Master. {status, message, data}
 */
const softDeleteManyMaster = async (req,res) => {
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
    let updatedMaster = await deleteDependentService.softDeleteMaster(query, updateBody);
    if (!updatedMaster) {
      return res.recordNotFound();
    }
    return res.success({ data:updatedMaster });
  } catch (error){
    return res.internalServerError({ message:error.message }); 
  }
};

module.exports = {
  addMaster,
  bulkInsertMaster,
  findAllMaster,
  getMaster,
  getMasterCount,
  updateMaster,
  bulkUpdateMaster,
  partialUpdateMaster,
  softDeleteMaster,
  deleteMaster,
  deleteManyMaster,
  softDeleteManyMaster    
};