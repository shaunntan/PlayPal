var AWS = require("aws-sdk");
var fs = require('fs');
const { v4: uuidv4 } = require('uuid');

AWS.config.update({
    region: "us-west-2",
    endpoint: "http://localhost:8000"
});

var docClient = new AWS.DynamoDB.DocumentClient();

console.log("Importing facilties into DynamoDB. Please wait.");

var facilities = JSON.parse(fs.readFileSync('facilities.json', 'utf8'));
facilities.forEach(function(facility) {
    var params = {
        TableName: "Facilities",
        Item: {
            "_id":  uuidv4(),
            "name":  facility.ROAD_NAME,
            "latitude": facility.latitude,
            "longitude":  facility.longitude
        }
    };

    docClient.put(params, function(err, data) {
       if (err) {
           console.error("Error JSON:", JSON.stringify(err, null, 2));
       } else {
           console.log("PutItem succeeded");
       }
    });
});
