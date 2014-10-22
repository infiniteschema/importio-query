/* this is all example code which should be changed; see query.js for how it works */

authUrl = "http://importio-signedserver.herokuapp.com/";
reEx.push(/\/_source$/);

//change doReady() to auto-query on document ready
var doReadyOrg = doReady;
doReady = function() {
  doReadyOrg();
  doQuery();//query on ready
}

/* Query for tile Store Locators
*/
fFields.push({id: "postcode", html: '<input id="postcode" type="text" value="EC2M 4TP" />'});
fFields.push({id: "submit", html: '<button id="submit" onclick="doQuery();">Query</button>'});
qObj.connectorGuids = [
  "8f628f9d-b564-4888-bc99-1fb54b2df7df",
  "7290b98f-5bc0-4055-a5df-d7639382c9c3",
  "14d71ff7-b58f-4b37-bb5b-e2475bdb6eb9",
  "9c99f396-2b8c-41e0-9799-38b039fe19cc",
  "a0087993-5673-4d62-a5ae-62c67c1bcc40"
];
var doQueryMy = function() {
  qObj.input = {
    "postcode": $("#postcode").val()
  };
}

/* Here's some other example code for a completely different API
colNames = ["ranking", "title", "artist", "album", "peak_pos", "last_pos", "weeks", "image", "spotify", "rdio", "video"];
filters["title"] = function(val) {
  return "<b>" + val + "</b>";
}
filters["video"] = function(val) {
  if (val.substring(0, 7) != "http://") {
    return val;
  }
  return '<a href="' + val + '" target="_blank">' + val + '</a>';
}
doQuery = function() {
  doQueryPre();

  for (var page = 0; page < 10; page++) {
    importio.query({
      "connectorGuids": [
        "XYZ"
      ],
      "input": {
        "webpage/url": "http://www.billboard.com/charts/hot-100?page=" + page
      }

    }, { "data": dataCallback, "done": doneCallback });
  }
}
*/
