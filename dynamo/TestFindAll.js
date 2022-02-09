
/**
 * Copyright 2010-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * This file is licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License. A copy of
 * the License is located at
 *
 * http://aws.amazon.com/apache2.0/
 *
 * This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
*/
var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-west-2",
  endpoint: "http://localhost:8000"
});

var docClient = new AWS.DynamoDB.DocumentClient();

var params = {
    TableName : "Facilities",
    Limit: 20
    // KeyConditionExpression: "#_id = :_id",
    // ExpressionAttributeNames:{
    //     "#_id": "_id"
    // },
    // ExpressionAttributeValues: {
    //     ":_id": "eca5d825-f51d-461c-88a2-c111c7d7b715"
    // }
};

docClient.scan(params, function(err, data) {
    if (err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
        console.log("Query succeeded.");
        // console.log(data.Items);
        data.Items.forEach(function(item) {
            console.log(item);
        // console.log(" -", item.year + ": " + item.title);
        });
    }
});
