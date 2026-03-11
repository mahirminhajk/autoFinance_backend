export function isValidDate(dateString) {
  const datePattern =
    /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])(?:-(?:19|20)\d\d)?$/;
  return datePattern.test(dateString);
}

export function parseDateString(dateString) {
  const parts = dateString.split("-");
  const year = parseInt(parts[2]) || new Date().getFullYear(); // Default to the current year if not provided
  const month = parseInt(parts[1]) - 1; // Months are zero-based
  const day = parseInt(parts[0]);
  return new Date(year, month, day);
}
