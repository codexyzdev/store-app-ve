import { memo } from "react";

interface NavigationCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
  colorScheme: "blue" | "green" | "orange" | "red" | "purple" | "indigo";
}

const colorClasses = {
  blue: {
    border: "border-blue-500",
    icon: "text-blue-500",
    link: "text-blue-600 hover:text-blue-800",
  },
  green: {
    border: "border-green-500",
    icon: "text-green-500",
    link: "text-green-600 hover:text-green-800",
  },
  orange: {
    border: "border-orange-500",
    icon: "text-orange-500",
    link: "text-orange-600 hover:text-orange-800",
  },
  red: {
    border: "border-red-500",
    icon: "text-red-500",
    link: "text-red-600 hover:text-red-800",
  },
  purple: {
    border: "border-purple-500",
    icon: "text-purple-500",
    link: "text-purple-600 hover:text-purple-800",
  },
  indigo: {
    border: "border-indigo-500",
    icon: "text-indigo-500",
    link: "text-indigo-600 hover:text-indigo-800",
  },
};

export const NavigationCard = memo(
  ({ title, description, href, icon, colorScheme }: NavigationCardProps) => {
    const colors = colorClasses[colorScheme];

    return (
      <div
        className={`bg-white p-6 rounded-lg shadow-lg border-l-4 ${colors.border} hover:shadow-xl transition-shadow duration-200`}
      >
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-lg font-semibold text-gray-800'>{title}</h3>
            <p className='text-gray-600'>{description}</p>
          </div>
          <div className={`text-3xl ${colors.icon}`}>{icon}</div>
        </div>
        <a
          href={href}
          className={`mt-4 inline-flex items-center ${colors.link} font-medium transition-colors duration-200`}
        >
          Ver {title.toLowerCase()} →
        </a>
      </div>
    );
  }
);

NavigationCard.displayName = "NavigationCard";
