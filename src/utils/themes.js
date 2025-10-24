export const themes = {
  modern: {
    name: "Modern Blue",
    description: "Clean and professional blue theme",
    colors: {
      primary: {
        light: "from-blue-600 to-blue-800",
        dark: "from-blue-500 to-blue-700"
      },
      secondary: {
        light: "from-green-600 to-green-800",
        dark: "from-green-500 to-green-700"
      },
      accent: "blue-600",
      accentDark: "blue-400",
      background: {
        light: "bg-gray-50",
        dark: "bg-gray-900"
      },
      card: {
        light: "bg-white",
        dark: "bg-gray-800"
      },
      cardHover: {
        light: "bg-gray-50",
        dark: "bg-gray-700"
      },
      text: {
        primary: {
          light: "text-gray-900",
          dark: "text-gray-100"
        },
        secondary: {
          light: "text-gray-600",
          dark: "text-gray-400"
        },
        muted: {
          light: "text-gray-500",
          dark: "text-gray-500"
        }
      },
      border: {
        light: "border-gray-200",
        dark: "border-gray-700"
      },
      input: {
        light: "border-gray-300",
        dark: "border-gray-600"
      }
    },
    gradients: {
      header: "from-blue-600 to-blue-800",
      skills: "from-blue-600 to-blue-800",
      languages: "from-green-600 to-green-800"
    }
  },
  elegant: {
    name: "Elegant Purple",
    description: "Sophisticated purple and gold theme",
    colors: {
      primary: {
        light: "from-purple-600 to-purple-800",
        dark: "from-purple-500 to-purple-700"
      },
      secondary: {
        light: "from-amber-500 to-amber-700",
        dark: "from-amber-400 to-amber-600"
      },
      accent: "purple-600",
      accentDark: "purple-400",
      background: {
        light: "bg-slate-50",
        dark: "bg-slate-900"
      },
      card: {
        light: "bg-white",
        dark: "bg-slate-800"
      },
      cardHover: {
        light: "bg-slate-50",
        dark: "bg-slate-700"
      },
      text: {
        primary: {
          light: "text-slate-900",
          dark: "text-slate-100"
        },
        secondary: {
          light: "text-slate-600",
          dark: "text-slate-400"
        },
        muted: {
          light: "text-slate-500",
          dark: "text-slate-500"
        }
      },
      border: {
        light: "border-slate-200",
        dark: "border-slate-700"
      },
      input: {
        light: "border-slate-300",
        dark: "border-slate-600"
      }
    },
    gradients: {
      header: "from-purple-600 to-purple-800",
      skills: "from-purple-600 to-purple-800",
      languages: "from-amber-500 to-amber-700"
    }
  },
  minimal: {
    name: "Minimal Gray",
    description: "Clean and minimal gray theme",
    colors: {
      primary: {
        light: "from-gray-600 to-gray-800",
        dark: "from-gray-500 to-gray-700"
      },
      secondary: {
        light: "from-teal-500 to-teal-700",
        dark: "from-teal-400 to-teal-600"
      },
      accent: "gray-600",
      accentDark: "gray-400",
      background: {
        light: "bg-gray-50",
        dark: "bg-gray-900"
      },
      card: {
        light: "bg-white",
        dark: "bg-gray-800"
      },
      cardHover: {
        light: "bg-gray-50",
        dark: "bg-gray-700"
      },
      text: {
        primary: {
          light: "text-gray-900",
          dark: "text-gray-100"
        },
        secondary: {
          light: "text-gray-600",
          dark: "text-gray-400"
        },
        muted: {
          light: "text-gray-500",
          dark: "text-gray-500"
        }
      },
      border: {
        light: "border-gray-200",
        dark: "border-gray-700"
      },
      input: {
        light: "border-gray-300",
        dark: "border-gray-600"
      }
    },
    gradients: {
      header: "from-gray-600 to-gray-800",
      skills: "from-gray-600 to-gray-800",
      languages: "from-teal-500 to-teal-700"
    }
  }
};

export const getThemeColors = (themeName, mode = 'light') => {
  const theme = themes[themeName] || themes.modern;
  return {
    ...theme.colors,
    mode,
    gradients: theme.gradients
  };
}; 