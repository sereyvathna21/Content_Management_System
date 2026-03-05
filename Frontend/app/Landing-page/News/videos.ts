export interface Video {
  id: string;
  embedUrl: string;
  title: string;
  description: string;
  category: string;
  date: string;
}

export const videos: Video[] = [
  {
    id: "1",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    title: "Introduction to Social Protection in Cambodia",
    description:
      "Learn about the social protection system and its impact on Cambodian communities.",
    category: "Educational",
    date: "2024-01-15",
  },
  {
    id: "2",
    embedUrl:
      "https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F892059626531538%2F&show_text=false&width=560&t=0",
    title: "Community Impact Stories",
    description:
      "Hear from community members about how social protection programs have changed their lives.",
    category: "Impact",
    date: "2024-01-20",
  },
  {
    id: "3",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    title: "Annual Conference Highlights 2023",
    description:
      "Key moments and discussions from our annual social protection conference.",
    category: "Events",
    date: "2023-12-10",
  },
  {
    id: "4",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    title: "Youth Employment Programs",
    description:
      "Explore initiatives helping young Cambodians access employment opportunities.",
    category: "Programs",
    date: "2024-02-01",
  },
  {
    id: "5",
    embedUrl:
      "https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F892059626531538%2F&show_text=false&width=560&t=0",
    title: "Healthcare Access for All",
    description:
      "Understanding how social protection ensures healthcare access for vulnerable populations.",
    category: "Healthcare",
    date: "2024-01-25",
  },
  {
    id: "6",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    title: "Education Support Initiatives",
    description:
      "Programs supporting education access for children from low-income families.",
    category: "Education",
    date: "2024-01-18",
  },
];
