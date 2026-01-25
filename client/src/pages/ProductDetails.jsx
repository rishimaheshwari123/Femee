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
import { storeReferralData, validateReferralLink, generateReferralLink } from "../services/operations/referral";
import { toast } from "react-toastify";
import { FaLink, FaWhatsapp, FaFacebook, FaTwitter, FaInfoCircle } from "react-icons/fa";

function ProductDetails() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const { productID, referrerId } = useParams();
  const [previewImg, setPreviewImg] = useState("");
  const { handleActive, activeClass } = useActive(0);
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);
  const { user, token } = useSelector((state) => state.auth);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [referralLink, setReferralLink] = useState("");
  const [hasPurchasedProduct, setHasPurchasedProduct] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(true);
  const [referrerInfo, setReferrerInfo] = useState(null);

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

  // Handle generate referral link
  const handleGenerateShareLink = async () => {
    if (!user || !token) {
      toast.error("Please login to generate referral link");
      return;
    }

    setGeneratingLink(true);
    try {
      const linkData = await generateReferralLink(productID, user._id, token);
      const fullUrl = `${window.location.origin}/product/${productID}/${user._id}`;
      setReferralLink(fullUrl);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(fullUrl);
      toast.success("✅ Referral link copied! Share it to earn commission.");
    } catch (error) {
      console.error("Error generating link:", error);
      toast.error("Failed to generate referral link");
    } finally {
      setGeneratingLink(false);
    }
  };

  // Handle copy to clipboard
  const handleCopyLink = async () => {
    if (!referralLink) {
      toast.error("Please generate referral link first");
      return;
    }
    
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success("✅ Link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  // Handle share on WhatsApp
  const handleShareWhatsApp = () => {
    if (!referralLink) {
      toast.error("Please generate referral link first");
      return;
    }
    const message = `Check out this amazing product: ${product.title}\n\n${referralLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Handle share on Facebook
  const handleShareFacebook = () => {
    if (!referralLink) {
      toast.error("Please generate referral link first");
      return;
    }
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
    window.open(facebookUrl, '_blank');
  };

  // Handle share on Twitter
  const handleShareTwitter = () => {
    if (!referralLink) {
      toast.error("Please generate referral link first");
      return;
    }
    const message = `Check out this amazing product: ${product.title}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(referralLink)}`;
    window.open(twitterUrl, '_blank');
  };

  useEffect(() => {
    // Handle referral link if referrerId is present
    if (referrerId && productID) {
      // Store referral data in localStorage
      storeReferralData(productID, referrerId);
      
      // Validate the referral link and get referrer info
      validateReferralLink(productID, referrerId)
        .then((response) => {
          console.log("Valid referral link:", response);
          // Extract referrer info from response
          if (response.data && response.data.referrer) {
            setReferrerInfo(response.data.referrer);
          }
        })
        .catch((error) => {
          console.error("Invalid referral link:", error);
        });
    }

    // Check if user has purchased this product
    const checkProductPurchase = async () => {
      if (user && token && productID) {
        try {
          setCheckingPurchase(true);
          console.log("Checking purchase for product:", productID);
          console.log("User:", user._id);
          
          // Call API to check if user has purchased this product
          const response = await fetch(`${process.env.REACT_APP_BASE_URL}/order/get`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log("User orders:", data);
            
            // Extract orders array from response
            const orders = data.orders || data;
            console.log("Orders array:", orders);
            
            // Check if any order contains this product
            const hasPurchased = orders.some(order => {
              console.log("Checking order:", order._id);
              console.log("Order items:", order.orderItems);
              
              return order.orderItems.some(item => {
                const itemProductId = item.product?._id || item.product;
                console.log("Item product ID:", itemProductId, "Looking for:", productID);
                return itemProductId === productID;
              });
            });
            
            console.log("Has purchased this product:", hasPurchased);
            setHasPurchasedProduct(hasPurchased);
          } else {
            console.error("Failed to fetch orders:", response.status);
          }
        } catch (error) {
          console.error("Error checking purchase:", error);
        } finally {
          setCheckingPurchase(false);
        }
      } else {
        console.log("Missing data - user:", !!user, "token:", !!token, "productID:", productID);
        setCheckingPurchase(false);
      }
    };

    checkProductPurchase();

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
  }, [productID, referrerId]);

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

            {/* Referral Link Section - Only for logged-in members who purchased this product */}
            {user && user.role === "member" && !checkingPurchase && hasPurchasedProduct && (
              <Card className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-300 shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <FaLink className="text-white" size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-green-900">
                        Share & Earn Commission
                      </h3>
                      <p className="text-xs text-green-700">
                        You've purchased this product - share your link!
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-green-800 leading-relaxed">
                    Generate your referral link and share it to earn commission when someone purchases through your link!
                  </p>

                  <Button
                    variant="success"
                    size="lg"
                    fullWidth
                    onClick={handleGenerateShareLink}
                    disabled={generatingLink}
                    className="shadow-md hover:shadow-lg transition-shadow"
                  >
                    {generatingLink ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FaLink className="mr-2" />
                        Generate My Referral Link
                      </>
                    )}
                  </Button>

                  {referralLink && (
                    <div className="space-y-3 pt-4 border-t-2 border-green-200">
                      <div className="bg-white p-4 rounded-xl border-2 border-green-300 shadow-sm">
                        <p className="text-xs font-semibold text-gray-600 mb-2">Your Referral Link:</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-800 break-all font-mono flex-1 bg-gray-50 p-2 rounded">
                            {referralLink}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyLink}
                            className="shrink-0"
                            title="Copy to clipboard"
                          >
                            📋 Copy
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant="success"
                          size="md"
                          onClick={handleShareWhatsApp}
                          className="flex items-center justify-center gap-1"
                        >
                          <FaWhatsapp size={18} />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </Button>
                        <Button
                          variant="primary"
                          size="md"
                          onClick={handleShareFacebook}
                          className="flex items-center justify-center gap-1"
                        >
                          <FaFacebook size={18} />
                          <span className="hidden sm:inline">Facebook</span>
                        </Button>
                        <Button
                          variant="info"
                          size="md"
                          onClick={handleShareTwitter}
                          className="flex items-center justify-center gap-1"
                        >
                          <FaTwitter size={18} />
                          <span className="hidden sm:inline">Twitter</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            

           

            {/* Referral Info - Only when coming via referral link */}
            {referrerId && referrerInfo && (
              <Card className="bg-purple-50 border-purple-200">
                <div className="flex items-start gap-3">
                  <FaInfoCircle className="text-purple-600 mt-1" size={20} />
                  <div className="flex-1">
                    <p className="font-semibold text-purple-800 mb-1">
                      🎉 You're purchasing via a referral link!
                    </p>
                    <p className="text-sm text-purple-700 mb-2">
                      Referred by: <span className="font-semibold">{referrerInfo.fName} {referrerInfo.lName}</span> ({referrerInfo.userName})
                    </p>
                    <p className="text-xs text-purple-600">
                      You'll be placed in their binary tree and become part of their team.
                    </p>
                  </div>
                </div>
              </Card>
            )}

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
