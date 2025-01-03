import React from 'react';
import { TbTrash } from 'react-icons/tb';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { handleIsCartOpen, removeFromCart } from '../../../redux/cartSlice';
import QuantityBox from './QuantityBox';
import { displayMoney } from '../../../helper/utills';

const CartItems = ( props) => {
    const dispatch = useDispatch();
    const { _id, slug,images, title,  price, highPrice} = props.product;
    const{quantity,size} = props;
     
    const newPrice = displayMoney(price);
    const oldPrice = displayMoney(highPrice);



    
    return (
        <div className="cart_item flex gap-4  py-4 items-center border-b-2 w-11/12 mx-auto">
            <figure className="w-[50%] ">
                <Link to={`/product/${slug}`} className='' onClick={()=>dispatch(handleIsCartOpen(false))}>
                    <img src={images[0]?.url} alt="product-img " className=''   />
                </Link>
            </figure>
            <div className=" flex flex-col gap-1 w-full">
                <div className=" flex items-center justify-between">
                    <h4 className="">
                        <Link to={`/${slug}`} className='text-lg font-montserrat font-semibold'>{title}</Link>
                    </h4>
                    <div className=" relative group flex ">
                        <span onClick={() => dispatch(removeFromCart(_id))} className="cursor-pointer group-hover:text-red-500 text-xl">
                            <TbTrash />
                        </span>
                        <div className="hidden group-hover:block absolute top-[30px] -left-10 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded w-[86px]">
                            Remove Item
                        </div>
                    </div>
                </div>
                <h2 className="  text-base font-semibold ">
                    {newPrice} &nbsp;
                    <small><del>{oldPrice}</del></small>
                </h2>
                <div className='font-montserrat text-sm '>
                    Size: <span className=''>{size}</span>
                </div>
                <QuantityBox itemId={_id} itemQuantity={quantity} />
            </div>
        </div>
    );
};

export default CartItems;
