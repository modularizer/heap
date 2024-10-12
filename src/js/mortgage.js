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


// Equivalent home price formula
function _calculateEquivalentHomePrice(downPayment, monthlyPayment, interestRate, loanTermYears){
    /* Given a down payment, monthly payment, interest rate, and loan term, calculate the home price a buyer can afford */
    const monthlyInterestRate = (1 + interestRate) ** (1/12) - 1;
    const numberOfPayments = loanTermYears * 12;
    const principal = (monthlyPayment / monthlyInterestRate) * (1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments));
    const totalCost = principal + downPayment;
    return totalCost;
}

function calculateEquivalentHomePrice(downPayment, monthlyPayment, baseInterestRate, loanTermYears){
    /* Given a down payment, monthly payment, base interest rate, and loan term, calculate the home price a buyer can afford,
     taking into account that the interest rate could change based on down payment percent*/
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

    console.log(`Down Payment: ${downPayment}, Monthly Payment: ${monthlyPayment}, Base Interest Rate: ${baseInterestRate}, Loan Term Years: ${loanTermYears}`);
    console.log(`Equivalent Home Price: ${equivalentHomePrice}`);
    return equivalentHomePrice;
}

export {
    calculateMonthlyPayment,
    calculateTotalCost,
    calculateEquivalentHomePrice,
}