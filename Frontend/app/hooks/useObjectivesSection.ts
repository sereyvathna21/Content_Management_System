import { useEffect, useRef, useState } from "react";
import type { Objective } from "@/types/objectives";

export function useIntersectionObserver() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1, rootMargin: "0px 0px -100px 0px" },
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return { isVisible, sectionRef };
}

export function useAutoRotation(objectives: Objective[]) {
  const [selectedObjective, setSelectedObjective] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedObjective((prev) => (prev + 1) % objectives.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [objectives.length]);

  return { selectedObjective, setSelectedObjective };
}
