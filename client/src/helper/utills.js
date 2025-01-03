
// Display Money in Indian Format
export const displayMoney = (n) => {
    if (n === null || n === undefined) {
        return 0; // or return a default value
      }
    const numFormat = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    });

    return numFormat.format(n).split('.', 1);
};


// Calculate Discount Percentage
export const calculateDiscount = (discountedPrice, originalPrice) => {
    if (discountedPrice === null || originalPrice === null || 
        discountedPrice === undefined || originalPrice === undefined) {
        return 0; // or return a default value
    }
    
    const discountedPercent = (discountedPrice / originalPrice) * 100;

    return Math.round(discountedPercent);
};


// Calculate Total Amount
export const calculateTotal = (arr) => {
    const total = arr.reduce((accum, val) => accum + val, 0);

    return total;
};