/**
 * Extracts initials from a name string
 * @param name - The full name to extract initials from
 * @returns The initials (e.g., "John Doe" -> "JD", "Mary Jane Smith" -> "MJS")
 */
export function getInitials(name: string): string {
  if (!name || typeof name !== 'string') {
    return '';
  }

  const trimmedName = name.trim();

  if (!trimmedName) {
    return '';
  }

  const nameParts = trimmedName.split(/\s+/);

  return nameParts
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    .slice(0, 3); // Limit to max 3 initials to prevent overly long strings
}
