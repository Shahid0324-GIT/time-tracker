import { useEffect, useState } from "react";

type Greeting =
  | "Good Morning"
  | "Good Afternoon"
  | "Good Evening"
  | "Good Night";

function getGreetingByHour(hour: number): Greeting {
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  if (hour >= 17 && hour < 22) return "Good Evening";
  return "Good Night";
}

export function useGreeting() {
  const [greeting, setGreeting] = useState<Greeting>("Good Morning");

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      setGreeting(getGreetingByHour(hour));
    };

    updateGreeting();

    const interval = setInterval(updateGreeting, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return greeting;
}
