import { Link } from 'react-router-dom';
import AddToCartButton from '../cart/AddToCartButton';

/**
 * Displays a single product card in the catalogue grid.
 *
 * Reads addItem from cart context directly rather than accepting it as a prop,
 * keeping the ProductGrid free of cart concerns.
 *
 * @param {number}  id    - Unique product identifier
 * @param {string}  title - Product name
 * @param {number}  price - Product price in USD
 * @param {string}  image - URL of the product image
 */

const ProductCard = ({ id, title, price, image }) => {
  return (
    // h-full ensures the card stretches to fill its grid cell,
    // keeping all cards in a row the same height regardless of title length.
    <div className="bg-blue-100 rounded-lg p-4">
      <div className="flex flex-col space-y-4 h-full">
        <Link to={`/products/${id}`} className="cursor-pointer flex-1">
          <div className="rounded bg-blue-300 h-48 p-2 w-full">
            {/* object-contain scales the image to fit without cropping —
                important for product photos that have transparent backgrounds
                and inconsistent aspect ratios. */}
            <img src={image} alt={title} className="object-contain h-full w-full rounded" />
          </div>
          <div className="flex-1 space-y-4 py-1 text-blue-900">
            <div className="space-y-2">
              {/* Price is shown above the title so it sits at the same visual
                  level across all cards, regardless of title line count. */}
              <div className="h-4 text-xl font-bold">{`$${price.toFixed(2)}`}</div>
            </div>
            <div><h3>{title}</h3></div>
          </div>
        </Link>
        {/* flex-1 on the content above pushes this button to the bottom of
            every card, keeping the grid rows visually aligned. */}
        <AddToCartButton id={id} title={title} price={price} image={image} />
      </div>
    </div>
  );
};

export default ProductCard;