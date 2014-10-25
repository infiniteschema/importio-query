var authUrl;//import.io auth url
var qObj = {};//passed to importio.query()
var fFields = [];//array of search form field objects
var fSel = "#search";//search form selector
var tSel = "#results";//results table selector
var colNames;//array of column names
var colNamesExtra;//array of extra column names received after first data object
var headerSep = ", ";//colNamesExtra header separator
var reIn = [], reEx = [];//include/exclude cols matching patterns
var filters = {};//functions to apply to data
var doLinkify = true;//turn urls into links
var doSearchDisable = true;//disable search inputs on query
var doSearchDisableSecs = 15;//seconds to re-enable search inputs on query
var timeCur;//newest timestamp
var t;//table object
var isDoneHeader = false;//whether headers have been loaded
var spinOpts = $.fn.spin.presets['small'];//spinner options
spinOpts.left = "100%";

$(document).ready(function() {
  doReady();
});

// default functions/callbacks
var doReady = function() {
  importio.init({
    "auth": authUrl,
    "host": "import.io"
  });
  
  for (var idx = 0; idx < fFields.length; idx++) {
    $(fSel).append(fFields[idx].html + "\n");
  }
}
var doQueryPre = function() {
  if (doSearchDisable) {
    $(fSel + ' *').disabled(true);
    timeCur = new Date().getTime();
    setTimeout(function(){searchDisableTimeout(timeCur);}, doSearchDisableSecs * 1000);
  }
  if (spinOpts) {
    $(fSel).spin(spinOpts);
  }
  
  if (isDoneHeader) {
    t.clear().draw();
  }
}  
var doQuery = function() {
  doQueryPre();
  
  if (typeof doQueryMy === 'function') {
    doQueryMy();
  }
  
  importio.query(qObj,
    { "data": dataCallback, "done": doneCallback }
  );
}
var dataCallback = function(data) {
  console.log("Data received", data);

  var d = data[0];
  if (!d) {
    return;
  }

  if (!isDoneHeader) {
    if (!colNames) {
      colNames = [];
      for (var k in d.data) {
        if ((reIn.length && !reArrTest(reIn, k))
          || (reEx.length && reArrTest(reEx, k))) {
          continue;
        }
        colNames.push(k);
      }
    }
    colNamesExtra = [];

    var htmlHeader = '';
    htmlHeader += '<tr>';
    for (var idx = 0; idx < colNames.length; idx++) {
      var k = colNames[idx];
      htmlHeader += '<th>' + k + '</th>';
    }
    htmlHeader += '<th></th>';// overflow col
    htmlHeader += '</tr>';
    $(tSel).append("<thead>" + htmlHeader + "</thead>\n<tfoot>" + htmlHeader + "</tfoot>");
    isDoneHeader = true;
    t = $(tSel).DataTable();// initialize DataTable after thead/tfoot created
    t.column(colNames.length).visible( false );// hide extra column for now
  } else {// check if headers need to change
    for (var k in d.data) {
      if ((reIn.length && !reArrTest(reIn, k))
        || (reEx.length && reArrTest(reEx, k))) {
        continue;
      }
      // check extra column
      if ((colNames.indexOf(k) == -1) && (colNamesExtra.indexOf(k) == -1)) {
        colNamesExtra.push(k);
        t.column(colNames.length).visible( true, false );
        var titleNew = colNamesExtra.join(headerSep);
        $(t.column(colNames.length).header()).html(titleNew);
        $(t.column(colNames.length).footer()).html(titleNew);
      }
    }
  }

  // build rows
  for (var i = 0; i < data.length; i++) {
    var d = data[i];
    var r = [];
    for (var idx = 0; idx < colNames.length; idx++) {
      var k = colNames[idx];
      var c = "";
      if (d.data.hasOwnProperty(k)) {
        c = d.data[k];
        if (typeof filters[k] === 'function') {
          c = filters[k](c, d.data);// send val and row
        }
        if (doLinkify && re_weburl.test(c)) {
          c = '<a href="' + c + '" target="_blank">' + c + '</a>';
        }
      }
      if (typeof filterAll === 'function') {
        c = filterAll(c, d.data);
      }

      r.push(c);
    }

    // overflow col
    var cellExtra = [];
    for (var k in d.data) {
      if (colNamesExtra.indexOf(k) != -1) {
        c = d.data[k];
        cellExtra.push(c);
      }
    }
    r.push(cellExtra.join(headerSep));

    t.row.add(r);
  }
  t.columns.adjust().draw();// recalculate column widths
}
var doneCallback = function(data) {
  console.log("Done, all data:", data);
  if (spinOpts) {
    $(fSel).spin(false);
  }
  if (doSearchDisable) {
    $(fSel + ' *').disabled(false);
  }
}
var filterAll = function(val, row) {
  return "<span>" + val + "</span>";
}

// helpers
function reArrTest(arr, val) {
  for (var idx = 0; idx < arr.length; idx++) {
    if (arr[idx].test(val)) {
      return true;
    }
  }
  return false;
}
$.fn.disabled = function(b) {
  return this.each(function() {
      if (typeof this.disabled != "undefined") this.disabled = !!b;
  });
}
function searchDisableTimeout(time) {
  if (timeCur != time) {
    return;
  }

  doneCallback("searchDisableTimeout");
}
