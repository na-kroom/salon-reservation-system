export const calculateEndTime = (
  startTime: string,
  duration: number
) => {
  const [hour, minute] =
    startTime.split(":").map(Number);

  const date = new Date();

  date.setHours(hour);
  date.setMinutes(minute + duration);

  return date.toLocaleTimeString(
    "ja-JP",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }
  );
};

export const timeToMinutes = (
  time: string
) => {
  const [hour, minute] =
    time.split(":").map(Number);

  return hour * 60 + minute;
};