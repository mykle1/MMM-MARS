/* Magic Mirror
 * Module: MMM-MARS
 *
 * By Mykle1
 *
 */
const NodeHelper = require('node_helper');
const request = require('request');



module.exports = NodeHelper.create({

    start: function() {
        console.log("Starting node_helper for: " + this.name);
    },

    getMARS: function(url) {
        request({
            url: url,
            method: 'GET'
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                var result = JSON.parse(body).photos;
				console.log(response.statusCode);
                this.sendSocketNotification('MARS_RESULT', result);
            }
        });
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === 'GET_MARS') {
            this.getMARS(payload);
        }
    }
});
