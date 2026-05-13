/**
 * Mercantile Hook Loop — PDP modal via the WordPress Interactivity API.
 *
 * When the user clicks a product link inside a wc:product-collection (catalog
 * grids, related-products sidebar), this module intercepts the navigation,
 * fetches the product page, extracts the `.mh-pdp` card, and renders it
 * inside a fixed-position modal overlay with a frosted-glass scrim. The user
 * can close via the × button, by clicking the scrim, or with the Escape key.
 *
 * Falls back to native navigation when:
 * - The user holds a modifier key (cmd/ctrl/shift/alt) — opens in new tab
 * - The link has target="_blank"
 * - The fetch errors
 * - JavaScript / the Interactivity API are unavailable
 *
 * Direct loads of /product/<slug> still render the full page (no modal),
 * so external / shared links still work.
 *
 * Architecture: a single interactive store named `mercantile/pdp-modal`.
 * Window-scoped listeners (keydown, popstate) are registered through iAPI
 * directives on the modal scaffold echoed at wp_footer by functions.php.
 * Per-link `data-wp-on--click` directives are injected server-side by a
 * `render_block_woocommerce/product-collection` filter — scoping the modal
 * trigger to product-collection rows so hand-coded `<a href="/product/…">`
 * links elsewhere on the page navigate normally.
 *
 * In-modal swaps (clicking a related product while the modal is already
 * open) use `history.replaceState` instead of pushState so a single back
 * press exits the modal regardless of how many products were swapped
 * through.
 *
 * WC product-gallery assets (carousel CSS + iAPI script modules) are
 * force-enqueued site-wide from functions.php so the modal-injected
 * gallery lays out and navigates correctly on non-product pages.
 */

import { store, getConfig, getElement } from '@wordpress/interactivity';

const NAMESPACE = 'mercantile/pdp-modal';

// Pool of in-character loading messages, seeded server-side via
// wp_interactivity_config() in functions.php so each label flows through
// __() for translation. Picked at random per open, never repeating the
// previous one. Falls back to a single literal if config is missing.
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

// ASCII Wapuu — original art, drawn by Jill, ~100×51 of U+2588 blocks.
// Rendered character-by-character while the product page is fetching
// (see startWapuuReveal). Each open shuffles a fresh reveal order so
// the wapuu materialises differently every time.
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

// Pre-compute the indices of every block character so reveal can
// shuffle them once and step through. Newlines and spaces stay put.
const WAPUU_BLOCK_INDICES = ( () => {
	const out = [];
	for ( let i = 0; i < WAPUU_ART.length; i++ ) {
		if ( WAPUU_ART[ i ] === '█' ) out.push( i );
	}
	return out;
} )();

// Total reveal duration, in ms. Tuned to feel like the wapuu is
// 'rendering in' rather than appearing instantly — but short enough
// that fast networks still show most of him.
const WAPUU_REVEAL_MS = 900;

let wapuuTimer = null;

function startWapuuReveal() {
	stopWapuuReveal();
	const el = document.querySelector( '.mh-pdp-modal__loading .mh-wapuu-ascii' );
	if ( ! el ) return;

	// Start with a blank canvas the same shape as the final art —
	// every block becomes a space, every newline stays. This locks
	// in the height of the loading area so it doesn't reflow as the
	// wapuu fills in.
	const blank = WAPUU_ART.replace( /█/g, ' ' );
	const buf = blank.split( '' );
	el.textContent = blank;

	// Fisher-Yates shuffle of the block indices.
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

const { state, actions } = store( NAMESPACE, {
	state: {
		isOpen: false,
		isLoading: false,
		html: '',
		currentUrl: '',
		loadingText: 'compiling…',
	},
	actions: {
		*open( url ) {
			// Track whether the modal was already open so in-modal swaps
			// (related-product clicks) use replaceState instead of pushState.
			// One history entry per modal session = one back press exits.
			const wasOpen = state.isOpen;
			state.isOpen = true;
			state.isLoading = true;
			state.loadingText = pickLoadingLabel();
			state.currentUrl = url;
			document.body.style.overflow = 'hidden';
			// Kick off the wapuu reveal on the next tick so the
			// loading element has rendered in the DOM.
			setTimeout( startWapuuReveal, 0 );

			try {
				// Always fetch fresh — the browser otherwise serves a stale
				// cached HTML, which means template / inline-style changes
				// (e.g. tweaks to padding on .mh-pdp__side) only show up
				// after a hard refresh of the product URL itself.
				const response = yield fetch( url, {
					credentials: 'same-origin',
					cache: 'no-store',
				} );
				if ( ! response.ok ) {
					throw new Error( 'Fetch failed: ' + response.status );
				}
				const text = yield response.text();
				const doc = new DOMParser().parseFromString( text, 'text/html' );
				const card = doc.querySelector( '.mh-pdp' );
				if ( ! card ) {
					throw new Error( 'No .mh-pdp in response' );
				}
				// Strip the breadcrumb header's close button — the modal has
				// its own × that's wired to the IxAPI close action.
				const innerClose = card.querySelector( '.mh-pdp__close' );
				if ( innerClose ) {
					innerClose.remove();
				}
				state.html = card.outerHTML;
				try {
					const entry = { mhPdpModal: true, url };
					const current = window.history.state;
					if ( current && current.mhPdpModal && current.url === url ) {
						// Already at this entry — popstate forward (browser
						// restored a modal URL). Don't push or replace; the
						// history is already in the right place.
					} else if ( wasOpen ) {
						// In-modal swap (related-product click) — collapse the
						// session to a single history entry so one back press
						// always exits.
						window.history.replaceState( entry, '', url );
					} else {
						window.history.pushState( entry, '', url );
					}
				} catch ( e ) { /* ignore history failures */ }
			} catch ( e ) {
				// Bail to native navigation on any fetch / parse error.
				state.isOpen = false;
				state.isLoading = false;
				stopWapuuReveal();
				document.body.style.overflow = '';
				window.location.href = url;
				return;
			}

			state.isLoading = false;
			stopWapuuReveal();
		},
		close() {
			if ( ! state.isOpen ) return;
			state.isOpen = false;
			state.html = '';
			stopWapuuReveal();
			document.body.style.overflow = '';
			// If we opened via pushState, restore the URL on close.
			if ( window.history.state && window.history.state.mhPdpModal ) {
				try {
					window.history.back();
				} catch ( e ) { /* ignore */ }
			}
		},
		stopPropagation( event ) {
			event.stopPropagation();
		},
	},
	callbacks: {
		onKeydown( event ) {
			if ( event.key === 'Escape' && state.isOpen ) {
				actions.close();
			}
		},
		// Imperatively syncs state.html into the element's innerHTML when
		// state.html changes. There's no native data-wp-html directive in
		// the Interactivity API (only data-wp-text for textContent), so we
		// use data-wp-watch on the content element which fires this callback
		// any time the watched state changes.
		onContentChange() {
			const { ref } = getElement();
			if ( ! ref ) return;
			if ( ref.innerHTML !== state.html ) {
				ref.innerHTML = state.html || '';
			}
		},
		// Per-link click handler bound by the
		// `render_block_woocommerce/product-collection` filter in
		// functions.php — every <a> inside a product collection carries
		// data-wp-on--click="mercantile/pdp-modal::callbacks.openFromLink".
		// Modifier-clicks and target="_blank" fall through to native
		// navigation by returning before preventDefault.
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
		// Window-level popstate handler, registered via
		// data-wp-on-window--popstate on the modal root. Two cases:
		// 1. Back away from a modal entry — close the modal.
		// 2. Forward to a modal entry (event.state.mhPdpModal) — reopen
		//    the modal at that URL. `actions.open` detects the URL is
		//    already the current location and skips the history push.
		onPopstate( event ) {
			const isModalEntry = event.state && event.state.mhPdpModal;
			if ( state.isOpen && ! isModalEntry ) {
				state.isOpen = false;
				state.html = '';
				stopWapuuReveal();
				document.body.style.overflow = '';
				return;
			}
			if ( ! state.isOpen && isModalEntry && event.state.url ) {
				actions.open( event.state.url );
			}
		},
	},
} );
