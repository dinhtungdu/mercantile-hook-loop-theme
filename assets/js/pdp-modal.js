/**
 * Mercantile Hook Loop — PDP loading overlay via the WordPress Interactivity API.
 *
 * When the user clicks a product link inside a wc:product-collection (catalog
 * grids, related-products sidebar), this module shows a full-screen loading
 * overlay with an ASCII Wapuu reveal animation, then navigates to the product
 * page. The product page renders without header/footer — a card-on-scrim
 * layout that all WC interactive elements hydrate natively.
 *
 * The close button on the product page (wired via the [mh_pdp_breadcrumb]
 * shortcode) calls actions.close(), which navigates back via history.back()
 * with a homepage fallback when there's no same-origin referrer.
 */

import { store, getConfig } from '@wordpress/interactivity';

const NAMESPACE = 'mercantile/pdp-modal';

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
	const el = document.querySelector( '.mh-pdp-modal__loading .mh-wapuu-ascii' );
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

const { state, actions } = store( NAMESPACE, {
	state: {
		isLoading: false,
		loadingText: 'compiling…',
	},
	actions: {
		open( url ) {
			state.isLoading = true;
			state.loadingText = pickLoadingLabel();
			document.body.style.overflow = 'hidden';
			setTimeout( startWapuuReveal, 0 );
			window.location.href = url;
		},
		close() {
			try {
				const ref = document.referrer;
				if ( ref && new URL( ref ).origin === window.location.origin ) {
					window.history.back();
					return;
				}
			} catch ( e ) { /* invalid referrer — fall through */ }
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
