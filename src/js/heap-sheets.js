import {calculateStats, calculateOverYears} from './heap.js';

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


function calculateIntoSheets(params) {
    console.log('params', params);
   // Example list of dictionaries
   const [dicts, stats] = calculateOverYears(params);
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

export {
    calculateStatsIntoSheets,
    calculateIntoSheets,
}