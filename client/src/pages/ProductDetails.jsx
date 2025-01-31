import React, { useState, useEffect } from "react";
import { fetchProductDetails } from "../services/operations/product";
import { Link, useParams } from "react-router-dom";
import "./ProductDetails.css";
import { displayMoney, calculateDiscount } from "../helper/utills";
import useActive from "../hooks/useActive";
import { MdOutlineDone } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { IoIosAdd, IoIosRemove } from "react-icons/io";

import { MdOutlineLocalShipping } from "react-icons/md";
import { addToCart } from "../redux/cartSlice";
import { useDispatch, useSelector } from "react-redux";

function ProductDetails() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const { productID } = useParams();
  const [previewImg, setPreviewImg] = useState("");
  const { handleActive, activeClass } = useActive(0);
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);

  const { allProduct } = useSelector((state) => state.product);
  const { cart } = useSelector((state) => state.cart);

  const handlePreviewImg = (images, i) => {
    setPreviewImg(images[i].url);
    handleActive(i);
  };

  // handling Add-to-cart
  const handleAddItem = () => {
    dispatch(addToCart({ products: product }));
  };

  function increaseQuantityHandler() {
    if (product.stock <= quantity) {
      return;
    }

    setQuantity((prv) => prv + 1);
  }

  function deceraseQuantityHandler() {
    if (quantity <= 1) {
      return;
    }
    setQuantity((prv) => prv - 1);
  }

  useEffect(() => {
    // Calling fetchProductDetails fucntion to fetch the details
    const isProductAvailble = allProduct.find((item) => item._id === productID);

    if (isProductAvailble) {
      setProduct(isProductAvailble);
      setPreviewImg(isProductAvailble?.images[0].url);
      // console.log(isProductAvailble)
    } else {
      (async () => {
        try {
          setLoading(true);
          const res = await fetchProductDetails(productID);
          // console.log("Product details res: ", res);

          if (res.data !== undefined) {
            setProduct(res?.data?.productDetails);
            console.log(res?.data?.productDetails?.images[0].url);
            setPreviewImg(res?.data?.productDetails?.images[0].url);
          }
          setLoading(false);
        } catch (error) {
          console.log("Could not fetch Course Details");
          setLoading(false);
        }
      })();
    }
  }, [productID]);

  if (loading || !product) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner"></div>
      </div>
    );
  }

  const isProductInCart = cart.some(
    (cartItem) => cartItem.product._id === productID
  );

  // calculating Prices

  const discountedPrice = product?.highPrice - product?.price;
  const newPrice = product ? displayMoney(product.price) : 0;
  const oldPrice = product ? displayMoney(product.highPrice) : 0;
  const savedPrice = displayMoney(discountedPrice);
  const savedDiscount = calculateDiscount(discountedPrice, product?.price);

  return (
    <>
      <div className="prodcutDetialsContainer min-w-screen ">
        <section className="section" id="product_details">
          <div className="product_container">
            <div className="wrapper prod_details_wrapper">
              {/*=== Product Details Left-content ===*/}
              <div className="prod_details_left_col">
                <div className="prod_details_tabs">
                  {product.images &&
                    product.images.map((img, i) => (
                      <div
                        key={i}
                        className={`tabs_item ${activeClass(i)}`}
                        onClick={() => handlePreviewImg(product.images, i)}
                      >
                        <img src={img.url} alt="product-img" />
                      </div>
                    ))}
                </div>
                <figure className="prod_details_img">
                  <img src={previewImg} alt="product-img" />
                </figure>
              </div>
              {/*=== Product Details Right-content ===*/}
              <div className="prod_details_right_col_001">
                <div className="flex justify-between">
                  <div>
                    <h1 className="prod_details_title">{product.title}</h1>
                    <h4 className="prod_details_info">
                      {product.description && product.description}
                    </h4>
                  </div>
                </div>

                <div className="prod_details_price">
                  <div className="price_box">
                    <h2 className="price">
                      {newPrice} &nbsp;
                      <small className="del_price">
                        <del>{oldPrice}</del>
                      </small>
                    </h2>
                    <p className="saved_price">
                      You save: {savedPrice} ({savedDiscount}%)
                    </p>
                    <span className="tax_txt">(With Shipping Charges)</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {product.sizes?.split(",").map((size, index) => (
                    <button
                      key={index}
                      className="px-4 py-2 text-sm font-semibold border border-gray-400 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                    >
                      {size.trim()}
                    </button>
                  ))}
                </div>
                <div className="seprator2"></div>

                <div className="productDescription">
                  <div className="deliveryText">
                    <MdOutlineLocalShipping />
                    We deliver! Just say when and how.
                  </div>
                </div>
                <div className="seprator2"></div>

                <div className="prod_details_additem mt-2">
                  <h5>QTY :</h5>
                  <div className="additem">
                    <button
                      onClick={deceraseQuantityHandler}
                      className="additem_decrease  text-white"
                    >
                      <IoIosRemove />
                    </button>
                    <input
                      readOnly
                      type="number"
                      value={quantity}
                      className="input"
                    />
                    <button
                      onClick={increaseQuantityHandler}
                      className="additem_increase "
                    >
                      <IoIosAdd />
                    </button>
                  </div>

                  {!isProductInCart ? (
                    <button
                      className=" bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                      onClick={handleAddItem}
                      disabled={product.stock <= 0}
                    >
                      Add to cart
                    </button>
                  ) : (
                    <Link
                      className=" bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                      to={"/cart"}
                    >
                      Go to cart
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default ProductDetails;
