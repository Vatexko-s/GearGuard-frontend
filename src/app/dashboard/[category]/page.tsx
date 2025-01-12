import React from 'react';

export default function CategoryPage({ params }: { params: { category: string } }) {
    const { category } = params;

    // You can fetch or define category-specific data here
    const categoryData: {[key: string]: string} = {
        Microphones: "Details about Microphones",
        Speakers: "Details about Speakers",
        Cables: "Details about Cables",
        Others: "Details about Others",
    };

    return (
        <div>
            <h1>{category}</h1>
            <p>{categoryData[category] || "No details available for this category."}</p>
        </div>
    );
}
