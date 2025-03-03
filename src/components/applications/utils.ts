
export const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'declined':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const formatAmount = (data: any) => {
  if (!data?.jsonb_data?.financialDetails?.loanAmount) return 'N/A';
  return `$${parseFloat(data.jsonb_data.financialDetails.loanAmount).toLocaleString()}`;
};
