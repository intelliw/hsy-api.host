mppt: Joi.object({                                                      //  { "mppt": { "id": "IT6415AD-01-001" }, 
id: Joi.string(),                                                   //    
data: Joi.array().items(Joi.object({                                //    "data": [
    time_local: Joi.date().utc().format([                           // "time_local": "20190209T150006.032+0700",
        'YYYYMMDDTHHmmss.SSSS+HHmm',                                //      RFC 3339
        'YYYYMMDDTHHmmss.SSSSZ',
        'YYYYMMDDTHHmmss.SSSS']),
    pv: Joi.object({                                                // "pv": { "volts": [48.000, 48.000], "amps": [6.0, 6.0] },      
        volts: Joi.array().items(Joi.number().positive()).max(4),   //      float (array), array size 1-4, + only
        amps: Joi.array().items(Joi.number().positive()).max(4)     //      float (array), array size 1-4, + only 
    }),
    battery: Joi.object({                                           // "battery": { "volts" : 55.1, "amps": 0.0 },
        volts: Joi.number().positive(),                             //      float, + only
        amps: Joi.number()                                          //      float, +/-
    }),
    load: Joi.object({                                              // "load": { "volts": [48.000, 48.000], "amps": [1.2, 1.2] },
        volts: Joi.array().items(Joi.number().positive()).max(2),   //      float (array), array size 1-2, + only
        amps: Joi.array().items(Joi.number().positive()).max(2)     //      float (array), array size 1-2, + only 
    }),
    status: Joi.string()                                            // "status": "0801"
        .hex().length(4)                                            //      4-character, hex-encoded
}) ),
}),                                                       
