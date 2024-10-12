function calculateGrowth(startingValue, growthRate, years){
    return startingValue * Math.pow(1 + growthRate, years);
}
function calculateGrowthOverMonths(startingValue, growthRate, loanTermYears){
    const months = loanTermYears * 12;
    return (new Array(months + 1)).fill(0).map((_, i) => calculateGrowth(startingValue, growthRate, i/12));
}
function calculateGrowthOverYears(startingValue, growthRate, loanTermYears){
    const years = loanTermYears;
    return (new Array(years + 1)).fill(0).map((_, i) => calculateGrowth(startingValue, growthRate, i));
}


function calculateGrowthRate(startingValue, endingValue, years){
    return Math.pow(endingValue / startingValue, 1 / years) - 1;
}

export {
    calculateGrowth,
    calculateGrowthOverMonths,
    calculateGrowthOverYears,
    calculateGrowthRate,
}