'use strict';

const validationRules = {
  
  tMF645serviceQualificationCreate: 
    [{ $: [{$noneOf: ["id", "href", "serviceQualificationDate", "state", "qualificationResult", 
                        "estimatedResponseDate", "effectiveQualificationDate", 
                        "eligibilityUnavailabilityReason", "alternateServiceProposal",
                        "expirationDate"]},
           {$present: ['serviceQualificationItem']}]},
     {"serviceQualificationItem": {$present: ["id"]}},
     {"serviceQualificationItem": {$noneOf: ["expirationDate", "qualificationItemResult"]}},
     {"serviceQualificationItem.qualificationItemRelationship": {$present: ["id", "type"]}},
     {"serviceQualificationItem.relatedParty": {$eitherOf: ["href", "id"]}},
     {"serviceQualificationItem.service.serviceCharacteristic": {$present: ["name", "value"]}}],

  //
  // TMF 641 Service Order, based on TMF641B Release 18.0.1 May 2018
  //   
  // Notes: 
  // 1) Handling of 'state' in POST is unclear in the document, here treated as not allowed
  // 2) orderItem is incorrectly labelled as 'serviceOrderItem' in TMF641B
  // 3) removed rule { "orderItem.action": {$notEqual: "add", $eitherOf: ["service.id", "service.href"]}}
  // 
  tMF641serviceOrderCreate:
    [{ $: { $noneOf: ["id", "href", "state", "orderDate", "completionDate", 
                        "expectedCompletionDate", "startDate"]}},
    { $: {$eitherOf: ["orderItem"]}},
    { "relatedParty": {$eitherOf: ["id", "href"]}},
    { "note": {$eitherOf: ["author", "text"]}},
    { "orderItem": {$notEmpty: true}},
    { "orderItem": {$present: ["action","id"]}},
    { "orderItem": {$noneOf: ["state"]}},
    { "orderItem.appointment": {$eitherOf: ["id", "href"]}},
    { "orderItem.orderItemRelationship": {$present: ["type", "id"]}},
    { "orderItem.service": {$eitherOf: ["id", "href"]}},
    { "orderItem.service": {$eitherOf: ["id", "href"]}},
    { "orderItem.service.serviceSpecification": {$eitherOf: ["id", "href"]}},  
	  { "orderItem.service.serviceSpecification.targetServiceSchema": {$present: ["@type", "@schemaLocation"]}},  
    { "orderItem.service.serviceRelationship": {$eitherOf: ["type", "service"] }},
    { "orderItem.service.serviceCharacteristic": {$eitherOf: ["name", "valueType", "value"]}},
    { "orderItem.service.place": {$eitherOf: ["id", "href"]}},
    { "orderItem.service.place": {$present: ["role", "@referredType"]}},
    { "orderItem.relatedParty": {$present: ["type"]}},
    { "orderItem.relatedParty": {$eitherOf: ["id", "href"]}},
    { "orderItem.orderRelationship": {$present: ["type"]}},
    { "orderItem.orderRelationship": {$eitherOf: ["id", "href"]}}
  ]


};


module.exports = { validationRules };
