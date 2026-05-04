export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const calculateChange = (cash: number, total: number) => {
  return Math.max(0, cash - total);
};

export const validatePayment = (cash: number, total: number) => {
  return cash >= total;
};
