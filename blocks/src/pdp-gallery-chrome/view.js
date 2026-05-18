/**
 * View-side iAPI store for `mercantile/pdp-gallery-chrome`.
 *
 * Two halves:
 *
 * - `state.counter` reads WooCommerce's locked
 *   `woocommerce/product-gallery` context via
 *   `getContext('woocommerce/product-gallery')`. The DOM scope is
 *   guaranteed by block.json `ancestor`: our block lives inside the
 *   gallery wrapper, so the closest `data-wp-context` is always WC's.
 *
 * - `actions.next` computes the wrapped next index, then calls Woo's
 *   private `actions.selectImage()`. Woo's own `selectNextImage()`
 *   clamps at length - 1, which is wrong for a "see more" toggle.
 *
 *   Keep the `selectImage` method lookup inside our action. The iAPI
 *   store proxy then captures the current event scope (our button) but
 *   switches the namespace to Woo's store, so Woo's internal
 *   `getContext()` / `getElement()` still resolve correctly.
 */
import { store, getContext } from '@wordpress/interactivity';

const wcLock =
	'I acknowledge that using a private store means my plugin will inevitably break on the next store release.';

// Hold a reference to Woo's locked namespace. We access methods lazily
// inside actions so the iAPI proxy captures the active element scope.
const { actions: productGalleryActions } = store(
	'woocommerce/product-gallery',
	{},
	{ lock: wcLock }
);

store( 'mercantile/pdp-gallery-chrome', {
	state: {
		get counter() {
			const ctx = getContext( 'woocommerce/product-gallery' );
			if ( ! ctx || ! Array.isArray( ctx.imageData ) ) {
				return '';
			}
			const total = ctx.imageData.length;
			const idx = ctx.imageData.indexOf( ctx.selectedImageId );
			const current = idx < 0 ? 1 : idx + 1;
			return `see more · ${ current }/${ total }`;
		},
	},
	actions: {
		next( event ) {
			if ( event && typeof event.stopPropagation === 'function' ) {
				event.stopPropagation();
			}

			const ctx = getContext( 'woocommerce/product-gallery' );
			if (
				! ctx ||
				! Array.isArray( ctx.imageData ) ||
				ctx.imageData.length === 0
			) {
				return;
			}

			const total = ctx.imageData.length;
			const cur = ctx.imageData.indexOf( ctx.selectedImageId );
			const nextIdx = ( ( cur < 0 ? 0 : cur ) + 1 ) % total;
			const selectImage = productGalleryActions.selectImage;

			if ( typeof selectImage === 'function' ) {
				selectImage( nextIdx );
			}
		},
	},
} );
