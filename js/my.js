/* this is all example code which should be changed; see query.js for how it works */

authUrl = "http://importio-signedserver.herokuapp.com/";
reEx.push(/\/_source$/);

/*
//change doReady() to auto-query on document ready
var doReadyOrg = doReady;
doReady = function() {
  doReadyOrg();
  doQuery();//query on ready
}
*/

//change doReady() to add autocomplete-related events
// http://jqueryui.com/autocomplete/ http://api.jqueryui.com/autocomplete/
var acField;//autocomplete data field
var acSel;//autocomplete input selector
var acsSel = "#autocomplete-spin";//autocomplete spinner selector
var cache = {};//autocomplete cache
var termCur = "";//autocomplete current term
var doReadyOrg = doReady;
doReady = function() {
  doReadyOrg();

  $(acSel)
  .focus()
  .bind("keydown", function(event) {
    // http://api.jqueryui.com/jQuery.ui.keyCode/
    switch(event.keyCode) {
    //don't fire autocomplete on certain keys
    case $.ui.keyCode.LEFT:
    case $.ui.keyCode.RIGHT:
      event.stopImmediatePropagation();
      return true;
      break;
    //submit form on enter
    case $.ui.keyCode.ENTER:
      doQuery();
      $(this).autocomplete("close");
      break;
    }
  })
  .autocomplete({
    minLength: 3,
    source: function(request, response) {
      var term = request.term.replace(/[^\w\s]/gi, '').trim().toUpperCase();//replace all but "words" [A-Za-z0-9_] & whitespaces
      if (term in cache) {
        doneCompleteCallbackStop();
        response(cache[term]);
        return;
      }

      termCur = term;
      if (spinOpts) {
        $(acsSel).spin(spinOpts);
      }
      cache[term] = [];
      doComplete(term);
      response(cache[term]);//send empty for now
    }
  });
};

function doComplete(term) {
  doQueryMy();
  var qObjComplete = jQuery.extend({}, qObj);//copy to new obj
  qObjComplete.maxPages = 1;
  importio.query(qObjComplete,
    { "data": function(data) {
          dataCompleteCallback(data, term);
      },
      "done": function(data) {
          doneCompleteCallback(data, term);
      }
    }
  );
}
var dataCompleteCallback = function(data, term) {
  console.log("Data received", data);

  for (var i = 0; i < data.length; i++) {
    var d = data[i];
    var c = d.data[acField];
    if (typeof filterComplete === 'function') {
      c = filterComplete(c);
    }
    c = c.trim();
    if (!c) {
      continue;
    }
    cache[term].push(c);
  }
}
var doneCompleteCallback = function(data, term) {
  console.log("Done, all data:", data);
  console.log("cache:", cache);

  // http://stackoverflow.com/questions/16747798/delete-duplicate-elements-from-an-array
  cache[term] = cache[term].filter(
    function(elem, index, self) {
      return index == self.indexOf(elem);
  });

  if (termCur != term) {
    return;
  }

  doneCompleteCallbackStop();
  $(acSel).trigger("keydown");
}
var doneCompleteCallbackStop = function() {
  termCur = "";
  if (spinOpts) {
    $(acsSel).spin(false);
  }
}

/* Query for tile Store Locators
*/
fFields.push({id: "postcode", html: '<input id="postcode" type="text" value="EC2M 4TP" />'});
fFields.push({id: "autocomplete-spin", html: '<span id="autocomplete-spin"></span>'});
fFields.push({id: "submit", html: '<button id="submit" onclick="doQuery();">Query</button>'});
acField = "address";
var filterComplete = function(val) {
  if (val.indexOf(", ") == -1) {
    return "";
  }

  return val.split(", ").pop();
}
acSel = "#postcode";
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
fFields.push({id: "title", html: '<input id="title" type="text" value="harry potter" />'});
fFields.push({id: "autocomplete-spin", html: '<span id="autocomplete-spin"></span>'});
fFields.push({id: "submit", html: '<button id="submit" onclick="doQuery();">Query</button>'});
acField = "title";
acSel = "#title";
filters["image"] = function(val, row) {
  return '<a href="' + val + '" target="_blank">' + val + '</a>';
}
qObj.connectorGuids = [
  "ABC"
];
var doQueryMy = function() {
  qObj.input = {
    "search": $("#title").val()
  };
}
*/

/* Here's some other example code for a completely different API
colNames = ["ranking", "title", "artist", "album", "peak_pos", "last_pos", "weeks", "image", "spotify", "rdio", "video"];
filters["title"] = function(val, row) {
  return "<b>" + val + "</b>";
}
filters["video"] = function(val, row) {
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
