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
    if ((n <= 1)){
        return (n * 100).toFixed(maxDecimals) + "%";
//        return Math.round(n * 100, 1) + "%";
    }
    if (n > (10 ** maxPrecedingDigits)){
        let x = (n / 1000).toFixed(maxDecimals);
        if (x < (10 ** maxPrecedingDigits)){
            return x + " K";
        }
        x = (n / 1000000).toFixed(maxDecimals);
        if (x < (10 ** maxPrecedingDigits)){
            return x + " M";
        }
        let e = Math.floor(Math.log10(n));
        let m = n / (10 ** e);
        return m.toFixed(maxDecimals) + " e" + e;
    }
    return n.toFixed(maxDecimals);
}

export {
    parseNumber,
    prettifyNumber
}