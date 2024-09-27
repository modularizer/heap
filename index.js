// Formulas for mortgage calculations for use in Google Sheets using Google Apps Script

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
var pretty = new Proxy(raw, {
    get: function(target, name){
        return parseNumber(target[name]);
    },
    set: function(target, name, value){
        target[name] = prettifyNumber(value);
    }
});



function parseNumber(s){
    let o = s;
    if (typeof s === "number"){
        return s;
    }
    if (s.toLowerCase() === "k"){
        return 1000;
      }else if (s.toLowerCase() === "m"){
        return 1000000;
      }
    if (!isNaN(s)){
        return parseFloat(s);
    }
    if (s.endsWith("%")){
        return parseNumber(s.slice(0, -1)) / 100;
    }
   s = s.trim().replace("$", "").replaceAll(",", "").replaceAll(" ","").toLowerCase();


  let s2 = s.replaceAll("k", "").replaceAll("m", "").replaceAll("e", "");
  if (isNaN(s2)){
    return o;
  }


  if (s.endsWith("k")){
    return parseNumber(s.slice(0, -1)) * 1000;
  }else if (s.endsWith("m")){
    return parseNumber(s.slice(0, -1)) * 1000000;
  } else if (!s){
    return 0;
  } else if (s.includes('e')){
    let [a, b] = s.split('e');
    return parseFloat(a) * Math.pow(10, parseFloat(b));
  }else{
    return parseFloat(s);
  }
}

function prettifyNumber(n, maxDecimals=0, maxPrecedingDigits=3){
    if (isNaN(n)){
        return n;
    }
    if (n < 0){
        return "-" + prettifyNumber(-n, maxDecimals, maxPrecedingDigits);
    }
    if (n === 0){
        return "0";
    }
//    if ((n <= 1)){
//        return Math.round(n * 100, maxDecimals) + "%";
//    }
    if (n > (10 ** maxPrecedingDigits)){
        let x = (n / 1000).toFixed(maxDecimals);
        if (x < (10 ** maxPrecedingDigits)){
            return x + "K";
        }
        x = (n / 1000000).toFixed(maxDecimals);
        if (x < (10 ** maxPrecedingDigits)){
            return x + "M";
        }
        let e = Math.floor(Math.log10(n));
        let m = n / (10 ** e);
        return m.toFixed(maxDecimals) + "e" + e;
    }
    return n.toFixed(maxDecimals);
}





function adjustRate(down){
   if (down < 0.05){
       // big penalty for <5% down payment, realistically you just can't get a loan
       return 0.02;
   }else if (down < 0.1){
       // 5-10% down payment, you can get a loan but it will be expensive
       return 0.008;
   }else if (down < 0.15){
       // 10-15% down payment, you can get a loan but it will be more expensive
       return 0.005;
   }else if (down < 0.2){
      // 15-20% down payment, you can get a loan but it will be a bit more expensive
      return 0.003;
   }else if (down < 0.25){
      // 20 is "normal" down payment, no adjustment
      return 0;
    }else if (down < 0.3){
      // >25% maybe you get a slight discount
      return -0.0008;
    }else{
      // >30% maybe you get a bigger discount (but diminishing returns)
      return -0.0012;
    }
}

// Monthly payment formula
function calculateMonthlyPayment(principal=1000000, interestRate=0.07, loanTermYears = 30){
    const monthlyInterestRate = (1 + interestRate) ** (1/12) - 1;
    const numberOfPayments = loanTermYears * 12;
    const monthlyPayment = principal * monthlyInterestRate / (1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments));
    return monthlyPayment;
}

// Total cost formula
function calculateTotalCost(principal=1000000, downPayment=200000, interestRate=0.07, loanTermYears = 30){
    const numberOfPayments = loanTermYears * 12;
    const monthlyPayment = calculateMonthlyPayment(principal, interestRate, loanTermYears);
    const totalCost = monthlyPayment * numberOfPayments + downPayment;
    return totalCost;
}

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


// Equivalent home price formula
function _calculateEquivalentHomePrice(downPayment, monthlyPayment, interestRate, loanTermYears){
    const monthlyInterestRate = (1 + interestRate) ** (1/12) - 1;
    const numberOfPayments = loanTermYears * 12;
    const principal = (monthlyPayment / monthlyInterestRate) * (1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments));
    const totalCost = principal + downPayment;
    return totalCost;
}

function calculateEquivalentHomePrice(downPayment, monthlyPayment, baseInterestRate, loanTermYears){
    let interestRate = baseInterestRate;
    let i = 0;
    let equivalentHomePrice = 0;
    while((i < 10)){
        equivalentHomePrice = _calculateEquivalentHomePrice(downPayment, monthlyPayment, interestRate, loanTermYears);
        let ir = adjustRate(downPayment/ equivalentHomePrice);
        if (ir === interestRate){
            break;
        }
        i += 1;
    }
    return equivalentHomePrice;
}


function calculateOverMonths({
    homePrice,
    homebuyerDown,
    heapPayment,
    interestRate=0.07,
    equityAppreciationRate=0.04,
    loanTerm=30,
    extraPrincipalPayment=0,
    key=undefined,
    month=undefined,
    year=undefined,
}){
    extraPrincipalPayment = extraPrincipalPayment || 0;

    let principal = homePrice - homebuyerDown - heapPayment;

    const monthlyInterestRate = (1 + interestRate) ** (1/12) - 1;
    const monthlyEquityAppreciationRate = (1 + equityAppreciationRate) ** (1/12) - 1;
    const numberOfPayments = loanTerm * 12;
    const monthlyPayment = principal * monthlyInterestRate / (1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments));


    const bareHomeownerEquity = [homebuyerDown];
    const homeownerEquityAppreciation = [0];
    const homeownerEquityWithAppreciation = [homebuyerDown];
    const heapEquity = [heapPayment];
    const remainingPrincipal = [principal];
    const interestPayments = [0];
    const principalPayments = [0];
    const extraPrincipalPayments= [0];
    const totalPrincipalPayments = [0];
    const totalInterestPaid = [0];
    const months = [0];
    const homePriceWithAppreciation = [homePrice];

    const homeownerAppreciationRate = [];
    const heapAppreciationRate = [];
    const cumulativeHeapAppreciationRate =[];

    let cumulativeTotalInterestPaid = 0;
    let equity = homebuyerDown;
    let equityWithAppreciation = homebuyerDown;
    let equityAppreciation = 0;
    let homeAppreciation = 0;
    let heapAppreciation = 0;

    for (let i = 0; i < loanTerm * 12; i++){
        months.push(i + 1);

        let interestPayment = remainingPrincipal[i] * monthlyInterestRate;
        interestPayments.push(interestPayment);

        let principalPayment = monthlyPayment - interestPayment;
        principalPayments.push(principalPayment);

        homePriceWithAppreciation.push(homePriceWithAppreciation[i] * (1 + monthlyEquityAppreciationRate));

        equityAppreciation = equity * monthlyEquityAppreciationRate;
        homeownerEquityAppreciation.push(equityAppreciation);

        equityWithAppreciation += equityAppreciation;

        homeownerAppreciationRate.push(( 1 + equityAppreciation / equity)**12 - 1);

        homeownerEquityWithAppreciation.push(equityWithAppreciation);

        homeAppreciation = homePriceWithAppreciation[i] * monthlyEquityAppreciationRate;
        heapAppreciation = homeAppreciation - equityAppreciation;
        heapEquity.push(heapEquity[i] + heapAppreciation);

        heapAppreciationRate.push((1 + heapAppreciation / heapEquity[i])**12 - 1);

        principal -= principalPayment;
        equity += principalPayment;


        bareHomeownerEquity.push(equity);

        extraPrincipalPayments.push(extraPrincipalPayment);
        principal -= extraPrincipalPayment;
        remainingPrincipal.push(principal);

        cumulativeTotalInterestPaid += interestPayment;
        totalInterestPaid.push(cumulativeTotalInterestPaid);

        const pp = monthlyPayment - interestPayment;
        principalPayments.push(pp);

        extraPrincipalPayments.push(extraPrincipalPayment);
        totalPrincipalPayments.push(pp + extraPrincipalPayment);

        cumulativeHeapAppreciationRate.push(calculateGrowthRate(heapPayment, heapEquity[i], (i + 1)/12));
    }
    heapAppreciationRate.push(equityAppreciationRate);
    homeownerAppreciationRate.push(equityAppreciationRate);
    cumulativeHeapAppreciationRate.push(calculateGrowthRate(heapPayment, heapEquity[loanTerm * 12], loanTerm));
    let years = months.map(m => m / 12);
    r = {
        months,
        years,
        bareHomeownerEquity,
        homeownerEquityAppreciation,
        homeownerEquityWithAppreciation,
        heapEquity,
        remainingPrincipal,
        interestPayments,
        principalPayments,
        extraPrincipalPayments,
        totalPrincipalPayments,
        totalInterestPaid,
        homeownerAppreciationRate,
        heapAppreciationRate,
        homePriceWithAppreciation,
        cumulativeHeapAppreciationRate
    };

    if (year){
        month = year * 12;
    }
    if (key){
      key = key.trim().toLowerCase().replaceAll(" ", "");
      for (let k in r){
        if (k.toLowerCase() === key){
            r = r[k];
            if (month){
                r = r[month];
            }
            return r;
        }
      }
    }
    // map all the values to the month
    if (month){
        r = r.map((x, i) => ({month: month[i], value: x}));
    }
    return r;
}

function calculateOverYears(params){
    var r = calculateOverMonths(params);
    var keys = Object.keys(r);
    var result = {};
    keys.forEach(key => {
        result[key] = r[key].filter((_, i) => i % 12 === 0);

    });
    return result;
}


function calculateAll(
    homePrice,
    homebuyerDown,
    heapPayment,
    interestRate=0.07,
    equityAppreciationRate=0.04,
    loanTerm=30,
    extraPrincipalPayment=0,
    key=undefined,
    month=undefined,
    year=undefined,
) {
   // Example list of dictionaries
   const dicts = calculateOverYears({
    homePrice,
    homebuyerDown,
    heapPayment,
    interestRate,
    equityAppreciationRate,
    loanTerm,
    extraPrincipalPayment,
    key,
    month,
    year,

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



