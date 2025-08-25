export const formatDate = (dateString: string | Date | number, format: 'short' | 'long' = 'long') => {
  // Ensure we're working with a UTC date and converting to local timezone
  const date = new Date(dateString);
  
  if (format === 'short') {
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      timeZone: 'America/Los_Angeles', // Use Pacific timezone
    });
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Los_Angeles', // Use Pacific timezone
  });
};