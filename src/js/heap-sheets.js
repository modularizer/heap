// Formulas for mortgage calculations for use in Google Sheets using Google Apps Script
function calculateStatsIntoSheets(
    homePrice,
    homebuyerDown,
    heapPayment,
    interestRate=0.07,
    equityAppreciationRate=0.04,
    loanTerm=30,
    extraPrincipalPayment=0,
    hifMonthlyRate=0.001,
) {
    const stats = calculateStats({
        homePrice,
        homebuyerDown,
        heapPayment,
        interestRate,
        equityAppreciationRate,
        loanTerm,
        extraPrincipalPayment,
        hifMonthlyRate,
    });
    const result = [];
    for (let key in stats){
        result.push([key, stats[key]]);
    }
    return result;
}


function calculateIntoSheets(
    homePrice,
    homebuyerDown,
    heapPayment,
    interestRate=0.07,
    equityAppreciationRate=0.04,
    loanTerm=30,
    extraPrincipalPayment=0,
    hifMonthlyRate=0.001,
) {
   // Example list of dictionaries
   const [dicts, stats] = calculateOverYears({
    homePrice,
    homebuyerDown,
    heapPayment,
    interestRate,
    equityAppreciationRate,
    loanTerm,
    extraPrincipalPayment,
    hifMonthlyRate,
   });
   const headers = Object.keys(dicts);
   const length = dicts[headers[0]].length;
   let values = [];
    for (let i = 0; i < length; i++){
        let row = [];
        headers.forEach(header => {
            row.push(dicts[header][i]);
        });
        values.push(row);
    }

   const result = [headers].concat(values);
   return result;
}



