export function formatDate(date) {
  // Handle invalid or missing dates
  if (!date) {
    return 'Unknown date';
  }
  
  // Validate that date is a valid date string or object
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(dateObj);
}