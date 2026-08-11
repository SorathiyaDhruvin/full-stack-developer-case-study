const generateChallanNumber = (number) => {
    return `CH-${String(number).padStart(6, "0")}`;
};

module.exports = generateChallanNumber;