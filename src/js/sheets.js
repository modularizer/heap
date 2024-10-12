function getRange(range){
  if (!range){return}
  // check if the range is something like A2:B3
  let [sheetName, cellName] = range.split("!");
  if (cellName.match(/^[A-Z]+\d+$/) || cellName.match(/^[A-Z]+\d+:[A-Z]+\d+$/)){
      let sheet = sheetName?SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName):SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      let range = sheet.getRange(cellName);
      return range;
  }else{
    return getRangeByName(range);
  }
}
function getRangeByName(name) {
  // Get the active spreadsheet
  var sheet = SpreadsheetApp.getActiveSpreadsheet();

  var namedRange = sheet.getRangeByName(name);
  return namedRange;
}

var raw = new Proxy({}, {
    get: function(target, name){
        return getRangeByName(name).getValue();
    },
    set: function(target, name, value){
        getRangeByName(name).setValue(value);
    }
});
