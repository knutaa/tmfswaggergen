'use strict';

const {TError, TErrorEnum} = require('../utils/errorUtils');

function processAssignmentRules(operation, doc) {
  return new Promise(function(resolve, reject) {
    //
    // TMF641B_Service_Ordering_Conformance_Profile_R18.0.0.docx
    //
    if (operation === 'tMF641serviceOrderCreate'){
      doc.state = 'acknowledged';
      doc.startDate = (new Date()).toISOString(); 
      doc.orderDate = (new Date()).toISOString();
      doc.orderItem.forEach(item => item.state = 'acknowledged' );
    } 

    //
    // TMF645B_Service_Qualification_Conformance_Profile_R18.0.0.docx
    //
    if (operation === 'tMF645serviceQualificationCreate'){
      doc.state = 'acknowledged';
      doc.serviceQualificationDate = (new Date()).toISOString(); 

      doc.serviceQualificationItem.forEach(item => item.state = 'acknowledged');
    } 

    //
    // TMF646B_Appointment_API_Conformance_Profile_R18.0.0.docx
    //
    if (operation === 'tMF646appointmentCreate'){
      doc.status = 'initialized';
      doc.creationDate = (new Date()).toISOString(); 
    } 

    //
    // TMF648B_Quote_Management_Conformance_Profile_R17.5.0.docx
    //
    if (operation === 'tMF648quoteCreate '){
      doc.state = 'inProgress';
      doc.quoteDate = (new Date()).toISOString();
      doc.quoteItem.forEach(item => item.state = 'inProgress' ); 

      if(doc.note && !doc.note.date) doc.note.date = (new Date()).toISOString(); // TODO: Check
    } 

    resolve(doc);
  });
};

module.exports = { processAssignmentRules };

