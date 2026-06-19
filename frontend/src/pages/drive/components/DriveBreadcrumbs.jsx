import React from "react";
import { MdHome, MdChevronRight } from "react-icons/md";

const DriveBreadcrumbs = ({ breadcrumbs, onBreadcrumbClick }) => {
  return (
    <div className="flex items-center gap-1 mb-2 text-sm bg-gray-50 p-3 rounded-lg">
      <button
        onClick={() => onBreadcrumbClick(-1)}
        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition"
      >
        <MdHome size={18} /> Home
      </button>
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb._id}>
          <MdChevronRight className="text-gray-400" size={18} />
          <button
            onClick={() => onBreadcrumbClick(index)}
            className={`font-medium transition ${
              index === breadcrumbs.length - 1
                ? "text-gray-800 cursor-default"
                : "text-blue-600 hover:text-blue-800"
            }`}
            disabled={index === breadcrumbs.length - 1}
          >
            {crumb.name}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};

export default DriveBreadcrumbs;
