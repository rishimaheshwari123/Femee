import React, { useState, useEffect } from "react";
import { fetchProductDetails } from "../services/operations/product";
import { Link, useParams } from "react-router-dom";
import { displayMoney, calculateDiscount } from "../helper/utills";
import useActive from "../hooks/useActive";
import { MdOutlineLocalShipping } from "react-icons/md";
import { addToCart } from "../redux/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { Container, Button, Badge, Spinner, Card } from "../components/ui";
import { QuantitySelector, PriceDisplay, SizeSelector } from "../components/features";

function ProductDetails() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const { productID } = useParams();
  const [previewImg, setPreviewImg] = useState("");
  const { handleActive, activeClass } = useActive(0);
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);
  const { user, token } = useSelector((state) => state.auth);

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
    return <Spinner fullScreen size="lg" />;
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
    <div className="min-h-screen bg-gray-50 py-8">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <Card padding="none" className="overflow-hidden">
              <div className="aspect-square bg-white">
                <img
                  src={previewImg}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </Card>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-3">
              {product.images &&
                product.images.map((img, i) => (
                  <Card
                    key={i}
                    padding="none"
                    className={`cursor-pointer overflow-hidden transition-all ${
                      activeClass(i)
                        ? "ring-2 ring-primary-500"
                        : "hover:ring-2 hover:ring-gray-300"
                    }`}
                    onClick={() => handlePreviewImg(product.images, i)}
                  >
                    <div className="aspect-square bg-white">
                      <img
                        src={img.url}
                        alt={`${product.title} ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Card>
                ))}
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.title}
              </h1>
              {product.description && (
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>

            {/* Price Section */}
            <Card>
              {!token || user?.role === "user" ? (
                <div className="text-2xl font-bold text-gray-900">
                  {displayMoney(product.highPrice)}
                </div>
              ) : (
                <div className="space-y-2">
                  <PriceDisplay
                    price={product.price}
                    originalPrice={product.highPrice}
                    size="lg"
                    showDiscount
                  />
                  <p className="text-sm text-gray-500">
                    (Including Shipping Charges)
                  </p>
                </div>
              )}
            </Card>

            {/* Sizes */}
            {product.sizes && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Available Sizes
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.split(",").map((size, index) => (
                    <Badge
                      key={index}
                      variant="default"
                      size="lg"
                      className="px-4 py-2 cursor-pointer hover:bg-primary-100 hover:text-primary-700 transition-colors"
                    >
                      {size.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery Info */}
            <Card variant="outlined" className="bg-blue-50 border-blue-200">
              <div className="flex items-center gap-3 text-blue-700">
                <MdOutlineLocalShipping size={24} />
                <p className="font-medium">
                  We deliver! Just say when and how.
                </p>
              </div>
            </Card>

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity
                </label>
                <QuantitySelector
                  quantity={quantity}
                  onIncrease={increaseQuantityHandler}
                  onDecrease={deceraseQuantityHandler}
                  max={product.stock}
                  size="lg"
                />
              </div>

              <div className="flex gap-3">
                {!isProductInCart ? (
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleAddItem}
                    disabled={product.stock <= 0}
                  >
                    {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                  </Button>
                ) : (
                  <Button variant="success" size="lg" fullWidth to="/cart">
                    Go to Cart
                  </Button>
                )}
              </div>

              {product.stock > 0 && product.stock < 10 && (
                <p className="text-sm text-orange-600 font-medium">
                  Only {product.stock} items left in stock!
                </p>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default ProductDetails;
