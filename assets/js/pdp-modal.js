/**
 * Mercantile Hook Loop — PDP modal via a native <dialog> + <iframe>.
 *
 * This module runs in two contexts and branches on `isEmbedded`:
 *
 * 1. Parent (a catalog/archive/search page). It owns the `.mh-pdp-dialog`
 *    injected on wp_footer. Clicking a product link calls `actions.open()`,
 *    which `showModal()`s the dialog — putting the dialog in the top layer
 *    with the *real* catalog still mounted underneath, dimmed by the
 *    `::backdrop` — and points the `<iframe>` at `/product/<slug>?mh-embed=1`.
 *    A real page load, fully hydrated, every WooCommerce asset, isolated.
 *    The URL is kept in sync with `history.pushState`/`replaceState`.
 *
 * 2. Embedded (the product page loaded inside that iframe). The close
 *    button and any related-product links resolve to the same store here.
 *    `actions.close()` posts a message up to the parent; `actions.open()`
 *    navigates the iframe in place (`location.replace`, so the iframe's own
 *    history stays flat) and tells the parent to show the loading overlay.
 *
 * A direct visit to /product/<slug> (no iframe) is the standalone product
 * page: `isEmbedded` is false and there is no dialog, so `actions.close()`
 * falls back to a normal navigation home.
 */

import { store, getConfig } from '@wordpress/interactivity';

const NAMESPACE = 'mercantile/pdp-modal';
const EMBED_PARAM = 'mh-embed';

// Consent string for WooCommerce's locked `woocommerce` iAPI store —
// must match the one wc-blocks and mercantile/cart-tab use verbatim.
const WC_LOCK =
	'I acknowledge that using a private store means my plugin will inevitably break on the next store release.';

// `window.parent === window` on a top-level document; they differ when this
// document is the product page running inside the modal's <iframe>.
const isEmbedded = window.parent !== window;

function getDialog() {
	return document.querySelector( '.mh-pdp-dialog' );
}
function getFrame() {
	return document.querySelector( '.mh-pdp-dialog__frame' );
}

// Build the iframe URL for a product: same path, plus the ?mh-embed=1 flag
// that tells functions.php to add the `mh-pdp-embed` body class.
function toEmbedUrl( url ) {
	const u = new URL( url, window.location.origin );
	u.searchParams.set( EMBED_PARAM, '1' );
	return u.toString();
}

// The clean (shareable) path the address bar should show for a product —
// the embed flag stripped back off.
function toCleanPath( url ) {
	const u = new URL( url, window.location.origin );
	u.searchParams.delete( EMBED_PARAM );
	return u.pathname + u.search;
}

let lastLoadingLabel = null;
function pickLoadingLabel() {
	const labels = getConfig( NAMESPACE ).loadingLabels || [];
	if ( ! labels.length ) return 'compiling…';
	const options = labels.filter( ( l ) => l !== lastLoadingLabel );
	const pool = options.length ? options : labels;
	const next = pool[ Math.floor( Math.random() * pool.length ) ];
	lastLoadingLabel = next;
	return next;
}

const WAPUU_ART = `                                            ████████████████
                                       █████████████████████████
                                   ████████████████    ████████████
                                 █████████                    █████████████████████████████
                               ██████                           ███████████████████████████
                             ██████             ███             ████                   ████
                           ██████               ███               █████              █████
                          ████████   █████                          ██████        ███████
                       ███████ ███  ██████                             ████████████████
                   █████████          █           ███                    ███████████
                  ███████ ██        ████████████████████████              ████
                  ██████████     ████████████████████████████             ████
                  ███████████████████████████                              ████
                   ████████████████████████                                 ███
                   ████   ███████████████                                   ████
                  ████   █████████████████    ███████████████               ████
                  ██████████████████████████████████████████████             ███
                 ██████████████████████       █████████████████████          ████
                █████████████    ███████     █ █████████████████████         ████
                █████  ██████    ████████    ██ ██████████████████████       ████
               ██████  ███████    ████████  ███ ███████████████████████      ████
               ██████   ██████    ████████  ████ ██████████████████████      ████
               ██████   ███████    ███████ █████ ██████████████████████      ████
               ███████  ████████    ██████ █████ ██████████████████████      ████
               ███████   ███████    █████ █████ ███████████████████████      ████
               ████████   ███ ███    ████ █████ ███████████████████████      ████
          ██████████████  ███ ████    ██ █████ ████████████████████████      ███
         ███████████████   ████████   ██ █████████████████████████████      ████
        █████   █████████   ████████    ████ ██████████████████████████     ████
       ████       █████████  ████████   ███     ██████████           ███   ████
       ████        █████████ █████████ ███       ███████                   ████
        ████        ████████ ██████████████       ████                    ████
         ████         █████████████████████        ███                   ████
          █████       █████████████████████         ███                 █████
           ██████      █████████████████████        ███               ██████
             ██████     ████████████████████        ███             ██████
              ████████  ████████████████████        ███          ████████
                 ███████████████████████████       ███      ███████████
                   ███████     █████████████      ██████████████  ████
                                    █████████   ██████████████   ████
                   ██████████            ████████████████████   ████
                  █████████████           █████████  ███████  █████
                 ████     ██████                   ███████   █████
                 ████        █████              ████████   █████
                 █████        ███████    ████████████    ██████
                  █████         █████████████████     ███████
                   ██████         ███████████      ████████
                     ████████                  █████████
                       ██████████         ████████████
                          ████████████████████████
                               ██████████████`;

const WAPUU_BLOCK_INDICES = ( () => {
	const out = [];
	for ( let i = 0; i < WAPUU_ART.length; i++ ) {
		if ( WAPUU_ART[ i ] === '█' ) out.push( i );
	}
	return out;
} )();

const WAPUU_REVEAL_MS = 900;

let wapuuTimer = null;

function startWapuuReveal() {
	stopWapuuReveal();
	const el = document.querySelector( '.mh-pdp-dialog__loading .mh-wapuu-ascii' );
	if ( ! el ) return;

	const blank = WAPUU_ART.replace( /█/g, ' ' );
	const buf = blank.split( '' );
	el.textContent = blank;

	const order = WAPUU_BLOCK_INDICES.slice();
	for ( let i = order.length - 1; i > 0; i-- ) {
		const j = Math.floor( Math.random() * ( i + 1 ) );
		[ order[ i ], order[ j ] ] = [ order[ j ], order[ i ] ];
	}

	const total = order.length;
	const tickMs = 16;
	const ticks = Math.max( 1, Math.round( WAPUU_REVEAL_MS / tickMs ) );
	const perTick = Math.max( 1, Math.ceil( total / ticks ) );
	let cursor = 0;

	wapuuTimer = setInterval( () => {
		const end = Math.min( cursor + perTick, total );
		for ( let i = cursor; i < end; i++ ) {
			buf[ order[ i ] ] = '█';
		}
		cursor = end;
		el.textContent = buf.join( '' );
		if ( cursor >= total ) {
			stopWapuuReveal();
		}
	}, tickMs );
}

function stopWapuuReveal() {
	if ( wapuuTimer ) {
		clearInterval( wapuuTimer );
		wapuuTimer = null;
	}
}

function showLoading() {
	state.isLoading = true;
	state.loadingText = pickLoadingLabel();
	startWapuuReveal();
}
function hideLoading() {
	state.isLoading = false;
	stopWapuuReveal();
}

// Point the iframe at a product. Always `location.replace()` rather than
// assigning `iframe.src`: assigning `src` pushes a joint session-history
// entry and makes the browser re-navigate the iframe on back/forward —
// `replace()` keeps the iframe out of session history entirely, so the
// parent's pushState/replaceState entries are the *only* thing back/forward
// traverses. Falls back to `src` only if the contentWindow isn't reachable.
function loadFrame( frame, url ) {
	const embedUrl = toEmbedUrl( url );
	try {
		frame.contentWindow.location.replace( embedUrl );
	} catch ( e ) {
		frame.src = embedUrl;
	}
}

const { state, actions } = store( NAMESPACE, {
	state: {
		isLoading: false,
		loadingText: 'compiling…',
	},
	actions: {
		open( url ) {
			// Inside the iframe: a related-product click. Tell the parent
			// the new path (so it can replaceState) and navigate the iframe
			// in place. The parent never reads the iframe's location — the
			// embedded page reports it explicitly.
			if ( isEmbedded ) {
				window.parent.postMessage(
					{ type: 'mh-pdp:navigate', path: toCleanPath( url ) },
					window.location.origin
				);
				window.location.replace( toEmbedUrl( url ) );
				return;
			}
			const dialog = getDialog();
			const frame = getFrame();
			if ( ! dialog || ! frame ) return;
			showLoading();
			loadFrame( frame, url );
			if ( ! dialog.open ) {
				dialog.showModal();
				document.body.classList.add( 'mh-pdp-open' );
			}
			const path = toCleanPath( url );
			history.pushState( { mhPdp: path }, '', path );
		},
		close() {
			// Inside the iframe: the [mh_pdp_breadcrumb] close button.
			// The parent owns the dialog, so hand the close up to it.
			if ( isEmbedded ) {
				window.parent.postMessage(
					{ type: 'mh-pdp:close' },
					window.location.origin
				);
				return;
			}
			const dialog = getDialog();
			if ( dialog && dialog.open ) {
				// The dialog's `close` event handler syncs history.
				dialog.close();
				return;
			}
			// Standalone product page (direct visit, no dialog): plain nav.
			window.location.href = '/';
		},
	},
	callbacks: {
		openFromLink( event ) {
			if ( event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ) {
				return;
			}
			const link = event.currentTarget;
			if ( ! link || ! link.href ) return;
			if ( link.target === '_blank' ) return;
			event.preventDefault();
			actions.open( link.href );
		},
	},
} );

// ---------------------------------------------------------------------------
// Parent-only wiring. The embedded product page never owns the dialog, the
// history, or the iframe — it only posts messages up (see actions above).
//
// History model: the parent's pushState/replaceState entries are the single
// source of truth. The iframe is decoupled from session history (loadFrame
// uses location.replace), so `back`/`forward` only ever traverse the parent's
// entries. The iframe's `load` event therefore does nothing but drop the
// loading overlay — it never touches history.
// ---------------------------------------------------------------------------
if ( ! isEmbedded ) {
	const dialog = getDialog();
	const frame = getFrame();

	// Re-sync the parent's WooCommerce cart store after a change made
	// inside the iframe. The iframe and parent each hold their own
	// `woocommerce` iAPI store instance against the same server cart;
	// refreshCartItems() re-fetches /wc/store/v1/cart so the parent's
	// cart-tab counter reflects what was added in the modal.
	function refreshParentCart() {
		try {
			const wc = store( 'woocommerce', {}, { lock: WC_LOCK } );
			wc?.actions?.refreshCartItems?.();
		} catch ( e ) { /* WC store not on this page — nothing to sync */ }
	}

	if ( dialog && frame ) {
		frame.addEventListener( 'load', () => {
			hideLoading();
		} );

		// Messages from the product page running inside the iframe.
		window.addEventListener( 'message', ( event ) => {
			if ( event.origin !== window.location.origin ) return;
			const data = event.data || {};
			if ( data.type === 'mh-pdp:close' ) {
				if ( dialog.open ) dialog.close();
			} else if ( data.type === 'mh-pdp:navigate' && data.path ) {
				// A related-product click inside the iframe. The iframe is
				// already navigating itself; just show the overlay and keep
				// the address bar in sync (replace, not push — intra-modal
				// steps shouldn't stack history entries).
				showLoading();
				history.replaceState( { mhPdp: data.path }, '', data.path );
			} else if ( data.type === 'mh-pdp:cart-updated' ) {
				refreshParentCart();
			}
		} );

		// Closing the dialog (Escape, or dialog.close()) is the single place
		// history is rewound — the close button, Escape, and a programmatic
		// close all converge here and only `back()` once. Also a catch-all
		// cart re-sync, in case anything was added/removed in the modal.
		dialog.addEventListener( 'close', () => {
			hideLoading();
			document.body.classList.remove( 'mh-pdp-open' );
			refreshParentCart();
			if ( history.state?.mhPdp ) history.back();
		} );

		// Back/forward across the parent's product entries.
		window.addEventListener( 'popstate', ( event ) => {
			const path = event.state?.mhPdp;
			if ( path ) {
				// Forward into (or back to) a product entry.
				let current;
				try {
					current = toCleanPath( frame.contentWindow.location.href );
				} catch ( e ) { /* unreachable — reload below */ }
				if ( current !== path ) {
					showLoading();
					loadFrame( frame, path );
				}
				if ( ! dialog.open ) {
					dialog.showModal();
					document.body.classList.add( 'mh-pdp-open' );
				}
			} else if ( dialog.open ) {
				// Stepped back out to the catalog.
				dialog.close();
			}
		} );
	}
}

// ---------------------------------------------------------------------------
// Embedded-only wiring (the product page running inside the modal's iframe).
// ---------------------------------------------------------------------------
if ( isEmbedded ) {
	// Click anywhere outside the .mh-pdp card — the transparent
	// .mh-pdp-wrap area, which is the dimmed catalog showing through —
	// closes the modal, the way clicking a dialog's backdrop would. The
	// iframe covers the whole dialog, so the parent never sees these
	// clicks; the embedded page has to report them.
	document.addEventListener( 'click', ( event ) => {
		if ( ! event.target?.closest?.( '.mh-pdp' ) ) {
			window.parent.postMessage(
				{ type: 'mh-pdp:close' },
				window.location.origin
			);
		}
	} );

	// WooCommerce fires `wc-blocks_added_to_cart` on document.body when an
	// item is added via blocks. Relay it up so the parent re-syncs its own
	// cart store — the two documents hold separate `woocommerce` stores.
	document.body.addEventListener( 'wc-blocks_added_to_cart', () => {
		window.parent.postMessage(
			{ type: 'mh-pdp:cart-updated' },
			window.location.origin
		);
	} );
}
