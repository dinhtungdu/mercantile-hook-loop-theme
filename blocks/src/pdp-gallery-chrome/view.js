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
 * - `actions.next` advances the gallery image and wraps back to the
 *   first after the last (WC's own `selectNextImage` clamps at
 *   length - 1, which is wrong for a "see more" toggle). We bypass
 *   WC's action because calling it across namespaces from JS doesn't
 *   switch iAPI's directive scope, so its internal `getContext()` /
 *   `getElement()` would resolve in our namespace instead of WC's.
 *
 *   Instead we mutate WC's context directly (`selectedImageId`,
 *   `isDisabledPrevious`, `isDisabledNext`) — reactive, so any of
 *   WC's directives that read those values update — and replicate
 *   WC's smooth scroll of the large-image container so the visible
 *   image actually changes.
 */
import { store, getContext, getElement } from '@wordpress/interactivity';

const wcLock =
	'I acknowledge that using a private store means my plugin will inevitably break on the next store release.';

// Hold a reference so iAPI knows we're a consumer of the locked
// namespace. We don't use any methods on it directly.
store( 'woocommerce/product-gallery', {}, { lock: wcLock } );

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
			const nextId = ctx.imageData[ nextIdx ];

			// Reactive mutation of WC's context. Other WC directives
			// reading these stay in sync (button-disabled state etc.).
			ctx.selectedImageId = nextId;
			ctx.isDisabledPrevious = nextIdx === 0;
			ctx.isDisabledNext = nextIdx === total - 1;

			// Replicate WC's smooth-scroll of the large-image strip so
			// the visible image actually changes. WC keeps all images
			// in a horizontal scroller and uses `scrollTo` to bring
			// the selected one into the viewport.
			const ref = getElement()?.ref;
			if ( ! ref ) {
				return;
			}
			const gallery = ref.closest(
				'.wp-block-woocommerce-product-gallery'
			);
			if ( ! gallery ) {
				return;
			}
			const container = gallery.querySelector(
				'.wc-block-product-gallery-large-image__container'
			);
			if ( ! container ) {
				return;
			}
			const target = container.querySelector(
				`img[data-image-id="${ nextId }"]`
			);
			if ( ! target ) {
				return;
			}
			const cr = container.getBoundingClientRect();
			const tr = target.getBoundingClientRect();
			const left =
				container.scrollLeft +
				( tr.left - cr.left ) -
				( cr.width - tr.width ) / 2;
			container.scrollTo( { left, behavior: 'smooth' } );
		},
	},
} );
