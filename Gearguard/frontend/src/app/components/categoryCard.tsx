import React from 'react';

interface CategoryCardProps {
    CategoryName: string;
    Icon?: JSX.Element; // Optional icon
}

const CategoryCard: React.FC<CategoryCardProps> = ({ CategoryName, Icon }) => {
    return (
        <div className="w-64 h-64 bg-white rounded-lg shadow-lg dark:bg-gray-800 flex flex-col items-center">
            <div className="w-full h-full overflow-hidden flex justify-center items-center">
                {Icon || <div className="text-gray-400 dark:text-gray-600">No Icon</div>}
            </div>
            <div className="text-center mt-2 mb-4 flex items-center gap-2">
                <span className="text-lg font-bold text-gray-700 dark:text-gray-200">{CategoryName}</span>
            </div>
        </div>
    );
};

export default CategoryCard;