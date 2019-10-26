//@ts-check
"use strict";
/**
 * ./producers/Features.js
 *  topic producer for feature toggles - to propogate configuration changes from host to consumer through message broker 
 */
const KafkaProducer = require('./KafkaProducer');

const log = require('../host').log;

class Features extends KafkaProducer {
    /**
     * superclass - 
     * clients must call sendToTopic() 
     * 
     * instance attributes:  
     *  producerObj": kafka.producer()
     * apiDatasetName                                                               // enums.params.datasets
     * kafkaTopic                                                                   // env.active.topics.monitoring
     * constructor arguments 
     * @param {*} apiDatasetName                                                    // enums.params.datasets              - e.g. pms       
     */
    constructor(apiDatasetName, kafkaTopic) {

        super(apiDatasetName, kafkaTopic);

    }

    /** extracts an array of modified data items and sends these as messages to the broker 
    * @param {*} datasets                                                           // an array of datasets
    * @param {*} sender                                                             // is based on the api key and identifies the source of the data. this value is added to sys.source attribute 
    */
    async sendToTopic(data, sender) {


        // send the message to the topics
        try {

            let msgObj = { itemCount: 1, messages: [] };
            msgObj.messages.push(super.createMessage(this.apiDatasetName, datasets));   // add to the message array
            super.sendToTopic(msgObj, sender);

        } catch (e) {
            log.exception(`${this.apiDatasetName} sendToTopic`, e.message, log.ERR.event());
        }

    }

}


module.exports = Features;
