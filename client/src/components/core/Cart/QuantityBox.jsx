import React, { useContext } from 'react';
import { FaPlus, FaMinus } from 'react-icons/fa';
import {increanQuantity,decreaseQuantity} from "../../../redux/cartSlice"
import { useDispatch } from 'react-redux';

const QuantityBox = (props) => {

    const { itemId, itemQuantity } = props;
const dispatch = useDispatch()
    


    return (
        <>
            <div className="   flex ">
              <div className=' b flex items-center'>
              <button
                    type="button"
                    onClick={() => dispatch(decreaseQuantity(itemId))}
                    className='p-[2px] border-1 bg-blue-200 '
                >
                    <FaMinus />
                </button>
                <span className="p-2 font-">
                    {itemQuantity}
                </span>
                <button
                    type="button"
                    onClick={() => dispatch(increanQuantity(itemId))}
                    // disabled={itemQuantity >= 5}
                    className='p-[2px] border-1 bg-blue-200'
                >
                    <FaPlus />
                </button>
              </div>
            </div>
        </>
    );
};

export default QuantityBox;