import { Interviewer } from '../types';

// Mock function to simulate finding available time slots from calendars.
export const findAvailableSlots = async (
  selectedInterviewers: Interviewer[]
): Promise<string[]> => {
  console.log(
    'Simulating API call to find available slots for:',
    selectedInterviewers.map((i) => i.name)
  );

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 750));

  if (selectedInterviewers.length === 0) {
    return [];
  }

  const slots: string[] = [];
  const now = new Date();

  // Find slots for the next 3 business days
  for (let d = 1; d <= 3; d++) {
    const day = new Date(now);
    day.setDate(now.getDate() + d);

    // Skip weekends
    if (day.getDay() === 0 || day.getDay() === 6) {
      continue;
    }

    // Generate slots from 9 AM to 5 PM
    for (let hour = 9; hour < 17; hour++) {
        // Simple logic to make slots seem different for different interviewers
        // FIX: The accumulator `acc` is a number, not an object with a length property. Use `acc` directly.
        const pseudoRandomFactor = selectedInterviewers.reduce((acc, curr) => acc + curr.id.length, 0);
        if ((hour + pseudoRandomFactor) % (selectedInterviewers.length + 1) !== 0) {
            const date = new Date(day);
            date.setHours(hour, 0, 0, 0);
            slots.push(date.toISOString());

            const dateHalf = new Date(day);
            dateHalf.setHours(hour, 30, 0, 0);
            slots.push(dateHalf.toISOString());
        }
    }
  }

  // Return up to 10 slots
  return slots.slice(0, 10);
};
