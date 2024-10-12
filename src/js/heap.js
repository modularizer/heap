import {calculateGrowthRate} from "./appreciation.js";
import {calculateEquivalentHomePrice, calculateMonthlyPayment} from "./mortgage.js";

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
    let params = {
        homePrice,
        homebuyerDown,
        heapPayment,
        interestRate,
        equityAppreciationRate,
        loanTerm,
        extraPrincipalPayment,
    };

    let hifYearlyInitial = 2000 + ((homePrice>300000)?(Math.max(homePrice-300000, 300000))*0.004:0) + ((homePrice>600000)?(homePrice-600000)*0.002:0);
    let hifMonthlyRate = (hifYearlyInitial / 12) / homePrice;

    if (homebuyerDown == 0){homebuyerDown = 1; heapPayment -= 1;}
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
    const hifPayments = [0];
    const homeownerPct = [homebuyerDown / homePrice];
    const heapPct = [heapPayment / homePrice];
    const bankPct = [(homePrice - homebuyerDown - heapPayment) / homePrice];
    const theoreticalEquivalentInvestorHomeEquity = [heapPayment];
    const theoreticalBacktracedRentToInvestor = [0];
    const equivalentMonthlyRentToInvestor = [0];

    const homeownerAppreciationRate = [];
    const heapAppreciationRate = [];
    const cumulativeHeapAppreciationRate =[];

    let cumulativeTotalInterestPaid = 0;
    let equity = homebuyerDown;
    let equityWithAppreciation = homebuyerDown;
    let equityAppreciation = 0;
    let homeAppreciation = 0;
    let heapAppreciation = 0;
    let interestPayment = 0;
    let principalPayment = 0;
    let hifPayment = 0;

    let lastHomePrice = homePrice;
    let currentHomePrice = homePrice;

    let unitRentPaymentSum = 0;
    const unitRentPayments = [];
    let unitRent = 1;

    for (let i = 0; i < loanTerm * 12; i++){
        unitRent = unitRent * (1 + monthlyEquityAppreciationRate);
        unitRentPayments.push(unitRent);
        unitRentPaymentSum += unitRent;

        months.push(i + 1);

        homeAppreciation = homePriceWithAppreciation[i] * monthlyEquityAppreciationRate;
        currentHomePrice += homeAppreciation;

        theoreticalEquivalentInvestorHomeEquity.push(theoreticalEquivalentInvestorHomeEquity[i] * (1 + monthlyEquityAppreciationRate));

        interestPayment = remainingPrincipal[i] * monthlyInterestRate;
        interestPayments.push(interestPayment);

        principalPayment = monthlyPayment - interestPayment;


        hifPayment = lastHomePrice * hifMonthlyRate;
        hifPayments.push(hifPayment);
        homePriceWithAppreciation.push(currentHomePrice);


        equityAppreciation = equityWithAppreciation * monthlyEquityAppreciationRate;
        equityWithAppreciation += equityAppreciation;
        equityWithAppreciation += principalPayment;

        homeownerEquityAppreciation.push(equityAppreciation);
        homeownerAppreciationRate.push(( 1 + equityAppreciation / equity)**12 - 1);
        homeownerEquityWithAppreciation.push(equityWithAppreciation);

        homeAppreciation = homePriceWithAppreciation[i] * monthlyEquityAppreciationRate;
        heapAppreciation = homeAppreciation - equityAppreciation;
        heapEquity.push(heapEquity[i] + heapAppreciation);

        const theoreticalSurplus = heapEquity[i] - theoreticalEquivalentInvestorHomeEquity[i];
        const theoreticalRent = theoreticalSurplus / unitRentPaymentSum;
        theoreticalBacktracedRentToInvestor.push(theoreticalRent);


        heapAppreciationRate.push((1 + heapAppreciation / heapEquity[i])**12 - 1);

        principal -= principalPayment;
        equity += principalPayment;


        bareHomeownerEquity.push(equity);

        extraPrincipalPayments.push(extraPrincipalPayment);
        principal -= extraPrincipalPayment;
        remainingPrincipal.push(principal);

        cumulativeTotalInterestPaid += interestPayment;
        totalInterestPaid.push(cumulativeTotalInterestPaid);


        principalPayments.push(principalPayment);

        extraPrincipalPayments.push(extraPrincipalPayment);
        totalPrincipalPayments.push(principalPayment + extraPrincipalPayment);

        cumulativeHeapAppreciationRate.push(calculateGrowthRate(heapPayment, heapEquity[i], (i + 1)/12));

        homeownerPct.push(equityWithAppreciation / currentHomePrice);
        heapPct.push(heapEquity[i] / currentHomePrice);
        bankPct.push(remainingPrincipal[i] / currentHomePrice);

        lastHomePrice = currentHomePrice;
    }
    heapAppreciationRate.push(equityAppreciationRate);
    homeownerAppreciationRate.push(equityAppreciationRate);
    cumulativeHeapAppreciationRate.push(calculateGrowthRate(heapPayment, heapEquity[loanTerm * 12], loanTerm));
    let years = months.map(m => m / 12);
    let r = {
        months,
        years,
        bareHomeownerEquity,
        homeownerEquityAppreciation,
        homeownerEquityWithAppreciation,
        heapEquity,
        theoreticalEquivalentInvestorHomeEquity,
        theoreticalBacktracedRentToInvestor,
        remainingPrincipal,
        interestPayments,
        principalPayments,
        extraPrincipalPayments,
        totalPrincipalPayments,
        totalInterestPaid,
        homeownerAppreciationRate,
        heapAppreciationRate,
        homePriceWithAppreciation,
        cumulativeHeapAppreciationRate,
        hifPayments,
        homeownerPct,
        heapPct,
        bankPct,
    };
    console.log(r);
    const stats = _calcStats(params, r);

    if (year){
        month = year * 12;
    }
    if (key){
      key = key.trim().toLowerCase().replaceAll(" ", "");
      for (let k of Object.keys(r)){
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

    if (key){
        for (let k of Object.keys(stats)){
            if (k.toLowerCase() === key){
                return stats[k];
            }
        }
    }
    return [r, stats]
}

function _calcStats(params, data){
    // Calculate the years to 50% investor equity
    let mp =data.principalPayments[1] + data.interestPayments[1];
    let ehp = calculateEquivalentHomePrice(
        params.homebuyerDown,
        mp,
        params.interestRate,
        params.loanTerm,
    );
    let buyingPowerIncrease = (params.homePrice - ehp) / ehp;
    let mpWithoutHelp = calculateMonthlyPayment(
        params.homePrice - params.homebuyerDown,
        params.interestRate,
        params.loanTerm,
    );

    return {
        monthlyPayment: mp,
        startingHIFMonthlyPayment: data.hifPayments[1],
        endingHIFMonthlyPayment: data.hifPayments[data.hifPayments.length - 1],

        equivalentHomePrice: ehp,
        buyingPowerIncrease: buyingPowerIncrease,
        monthlyPaymentWithoutHelp: mpWithoutHelp,
        monthlyPaymentDecreasePct: (mpWithoutHelp - mp) / mpWithoutHelp,


        finalHomePrice: data.homePriceWithAppreciation[data.homePriceWithAppreciation.length - 1],
        finalInvestorEquity: data.heapEquity[data.heapEquity.length - 1],
        finalInvestorEquityPct: data.heapPct[data.heapPct.length - 1],
        finalHomeownerEquity: data.homeownerEquityWithAppreciation[data.homeownerEquityWithAppreciation.length - 1],
        finalHomeownerEquityPct: data.homeownerPct[data.homeownerPct.length - 1],

        yearsTo50PercentInvestorEquity: data.heapPct.map((pct, i) => {
            if (pct >= 0.5) {
                return i;
            }
        }).filter(i => i !== undefined)[0] / 12,

        fullTermHEAPInterest: data.cumulativeHeapAppreciationRate[data.cumulativeHeapAppreciationRate.length - 1],
        theoreticalBacktracedRentToInvestor: data.theoreticalBacktracedRentToInvestor[data.theoreticalBacktracedRentToInvestor.length - 1],
        equivalentMarketRentToInvestor: (data.theoreticalBacktracedRentToInvestor[data.theoreticalBacktracedRentToInvestor.length - 1]) * (1 / data.heapPct[0])
    };
}

function calculateStats({
    homePrice,
    homebuyerDown,
    heapPayment,
    interestRate=0.07,
    equityAppreciationRate=0.04,
    loanTerm=30,
    extraPrincipalPayment=0,
}){
    const [_, stats] = calculateOverMonths({
        homePrice,
        homebuyerDown,
        heapPayment,
        interestRate,
        equityAppreciationRate,
        loanTerm,
        extraPrincipalPayment,
    });
    return stats;
}

function calculateOverYears(params){
    var [r, stats] = calculateOverMonths(params);
    var keys = Object.keys(r);
    var result = {};
    keys.forEach(key => {
        result[key] = r[key].filter((_, i) => i % 12 === 0);
    });
    return [result, stats];
}


export {
    calculateOverMonths,
    calculateStats,
    calculateOverYears,
}
