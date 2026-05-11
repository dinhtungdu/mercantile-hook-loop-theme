/**
 * Mercantile Hook Loop — keep the ticker's cart tab count in sync.
 *
 * The cart tab on the right edge of the ticker is server-rendered with
 * WC()->cart->get_cart_contents_count() on initial load, but stays
 * stale after add-to-cart / remove-from-cart unless we update it.
 *
 * Listens for the events that fire on cart mutations from both ends of
 * WC's ecosystem:
 *   - `added_to_cart` / `removed_from_cart` (jQuery, legacy mini-cart
 *     fragments path, also fired by assets/js/cart-ajax-submit.js)
 *   - `wc-blocks_added_to_cart` (custom DOM event fired by our cart-
 *     ajax-submit.js for the mini-cart block consumers)
 *   - `wc_fragments_refreshed` (jQuery, fragments re-hydrate)
 *
 * After any of those, re-fetches `/wp-json/wc/store/v1/cart` for an
 * authoritative count. Re-fetch is debounced so a flurry of events
 * doesn't trigger N requests.
 *
 * The Store API is unauthenticated for cart reads, so no nonce
 * juggling — just a credentialed GET that the session cookie covers.
 */

( function () {
	const COUNT_ID = 'mh-ticker-cart-count';
	const ENDPOINT = '/wp-json/wc/store/v1/cart';
	const DEBOUNCE_MS = 120;

	let timer = null;

	async function refresh() {
		const el = document.getElementById( COUNT_ID );
		if ( ! el ) return;
		try {
			const response = await fetch( ENDPOINT, {
				credentials: 'same-origin',
				headers: { Accept: 'application/json' },
			} );
			if ( ! response.ok ) return;
			const data = await response.json();
			const count = typeof data?.items_count === 'number' ? data.items_count : null;
			if ( count !== null ) {
				el.textContent = String( count );
			}
		} catch ( e ) {
			// Network blip — leave stale count, next event will retry.
		}
	}

	function schedule() {
		if ( timer ) clearTimeout( timer );
		timer = setTimeout( refresh, DEBOUNCE_MS );
	}

	// jQuery-flavour events (legacy WC + our cart-ajax-submit shim).
	if ( window.jQuery ) {
		window.jQuery( document.body ).on(
			'added_to_cart removed_from_cart wc_fragments_refreshed wc_fragment_refresh',
			schedule
		);
	}

	// Block-data flavour fired by assets/js/cart-ajax-submit.js.
	document.addEventListener( 'wc-blocks_added_to_cart', schedule );

	/* ----------------------------------------------------------------
	 * Click the ticker tab → open the mini-cart drawer.
	 *
	 * The WooCommerce mini-cart block (rendered in the section-head)
	 * is what owns the drawer UI. Clicking the ticker tab should
	 * delegate to that block's own button. If we can't find it (e.g.
	 * on a page that doesn't render the mini-cart, like /cart/), let
	 * the <a href="/cart/"> default-navigate as a graceful fallback.
	 * ---------------------------------------------------------------- */
	function openMiniCart( event ) {
		const tab = event.target.closest( '.mh-ticker__tab' );
		if ( ! tab ) return;
		// Modifier keys → new tab / window etc., respect the link.
		if ( event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ) return;

		// The mini-cart block exposes a button. Selector covers the
		// current WC blocks markup; falls back to a broader match.
		const trigger =
			document.querySelector( '.wc-block-mini-cart__button' ) ||
			document.querySelector( '.wc-block-mini-cart button' );
		if ( ! trigger ) return; // no mini-cart present → keep default link nav

		event.preventDefault();
		trigger.click();
	}
	document.addEventListener( 'click', openMiniCart );
} )();
