import React from 'react';
import ItemCard from '../../components/itemCard'

const Category = () =>{
    return (
        <div>
            <ItemCard availableItems={5} availability={true} />
        </div>
    );
}

export default Category;
