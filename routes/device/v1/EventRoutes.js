/**
 * EventRoutes.js
 * @description :: CRUD API routes for Event
 */

const express = require('express');
const router = express.Router();
const EventController = require('../../../controller/device/v1/EventController');
const { PLATFORM } =  require('../../../constants/authConstant'); 
const auth = require('../../../middleware/auth');
const checkRolePermission = require('../../../middleware/checkRolePermission');

router.route('/device/api/v1/event/create').post(auth(PLATFORM.DEVICE),checkRolePermission,EventController.addEvent);
router.route('/device/api/v1/event/list').post(auth(PLATFORM.DEVICE),checkRolePermission,EventController.findAllEvent);
router.route('/device/api/v1/event/count').post(auth(PLATFORM.DEVICE),checkRolePermission,EventController.getEventCount);
router.route('/device/api/v1/event/:id').get(auth(PLATFORM.DEVICE),checkRolePermission,EventController.getEvent);
router.route('/device/api/v1/event/update/:id').put(auth(PLATFORM.DEVICE),checkRolePermission,EventController.updateEvent);    
router.route('/device/api/v1/event/partial-update/:id').put(auth(PLATFORM.DEVICE),checkRolePermission,EventController.partialUpdateEvent);
router.route('/device/api/v1/event/softDelete/:id').put(auth(PLATFORM.DEVICE),checkRolePermission,EventController.softDeleteEvent);
router.route('/device/api/v1/event/softDeleteMany').put(auth(PLATFORM.DEVICE),checkRolePermission,EventController.softDeleteManyEvent);
router.route('/device/api/v1/event/addBulk').post(auth(PLATFORM.DEVICE),checkRolePermission,EventController.bulkInsertEvent);
router.route('/device/api/v1/event/updateBulk').put(auth(PLATFORM.DEVICE),checkRolePermission,EventController.bulkUpdateEvent);
router.route('/device/api/v1/event/delete/:id').delete(auth(PLATFORM.DEVICE),checkRolePermission,EventController.deleteEvent);
router.route('/device/api/v1/event/deleteMany').post(auth(PLATFORM.DEVICE),checkRolePermission,EventController.deleteManyEvent);

module.exports = router;
