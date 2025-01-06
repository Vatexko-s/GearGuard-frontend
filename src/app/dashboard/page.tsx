import React from 'react';
import CategoryCard from "@/app/components/categoryCard";
import Microphone from '../components/microphone.png';
import Speaker from '../components/speaker.png';
import Link from "next/link";

const Dashboard = () => {
    const categories = [
        { name: 'Microphones', image: Microphone },
        { name: 'Speakers', image: Speaker },
        { name: 'Cables', image: Microphone },
        { name: 'Others', image: Microphone },
    ];

    return (
        <div className='flex flex-wrap gap-4 justify-evenly'>
            {categories.map((category) => (
                <Link
                    key={category.name}
                    href={`/dashboard/${category.name.toLowerCase()}`}
                >
                    <CategoryCard CategoryName={category.name} ImageSrc={category.image} />
                </Link>
            ))}
        </div>
    );
};

export default Dashboard;
