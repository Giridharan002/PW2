import React from "react";

const Footer = ({ portfolioData }) => {
  return (
    <footer className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {portfolioData ? 'Portfolio generated from uploaded resume' : 'Static portfolio - Upload your resume to generate a personalized portfolio'}
      </p>
    </footer>
  );
};

export default Footer; 